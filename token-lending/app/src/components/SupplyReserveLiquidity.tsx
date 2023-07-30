import { 
    refreshReserveInstruction, 
    depositReserveLiquidityInstruction, 
    depositObligationCollateralInstruction, 
    refreshObligationInstruction 
} from "../utils/instructions";
import { Button, Modal, InputGroup, Form, Toast } from "react-bootstrap";
import { useState } from "react";
import { AnchorProvider } from "@project-serum/anchor";
import { 
    LAMPORTS_PER_SOL,
    PublicKey, 
    SystemProgram, 
    TransactionInstruction 
} from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction, 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createInitializeAccountInstruction,
    getMinimumBalanceForRentExemptAccount,
    createCloseAccountInstruction,
    ACCOUNT_SIZE
} from "@solana/spl-token";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { LENDING_PROGRAM_ID, WRAPPED_SOL } from "../utils/constants";
import { SmartInstructionSender, InstructionSet } from "@holaplex/solana-web3-tools";
import { useSmartSender } from '../utils/hooks';
import { COMMITMENT, MAX_RETRIES } from "../utils/constants";
import { Keypair } from "@solana/web3.js";
import { Signer } from "@solana/web3.js";
import { parseObligation } from "../utils/state";

export default function SupplyReserveLiquidity({
    element,
    provider,
    callback
}: {
    element: any;
    provider: AnchorProvider | undefined;
    callback?: () => Promise<void>;
}) {
    const [show, setShow] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [amount, setAmount] = useState<number | undefined>(undefined);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const { connection } = useConnection();
    const wallet = useAnchorWallet() as AnchorWallet;
    const { failureCallback } = useSmartSender();

    const supplyReserve = async(element: any) => {
        
        const instructions: TransactionInstruction[] = [];
        const cleanupInstructions: TransactionInstruction[] = [];
        const signers: Signer[] = [];
        let sourceLiquidity: PublicKey; 
        if (element.data?.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
            const lamports = await getMinimumBalanceForRentExemptAccount(connection) + amount! * LAMPORTS_PER_SOL
            const sourceAccount = Keypair.generate();
            sourceLiquidity = sourceAccount.publicKey;
            const createWrappedSolAccIx = SystemProgram.createAccount({
                fromPubkey: wallet?.publicKey!,
                newAccountPubkey: sourceLiquidity,
                lamports,
                space: ACCOUNT_SIZE,
                programId: TOKEN_PROGRAM_ID,
            });
            instructions.push(createWrappedSolAccIx);
            signers.push(sourceAccount)
            const initializeWrappedSolAccIx = createInitializeAccountInstruction(
                sourceLiquidity,
                element.data?.liquidity.mintPubkey,
                wallet.publicKey,
                TOKEN_PROGRAM_ID
            );
            instructions.push(initializeWrappedSolAccIx);
            cleanupInstructions.push(
                createCloseAccountInstruction(
                    sourceLiquidity,
                    wallet.publicKey,
                    wallet.publicKey,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );
        } else {
            sourceLiquidity = await getAssociatedTokenAddress(element.data?.liquidity.mintPubkey, wallet.publicKey!);
        };
        
        const destinationCollateral = await getAssociatedTokenAddress(element.data?.collateral.mintPubkey, wallet.publicKey!);
        const [lendingMarketAuthority] = await PublicKey.findProgramAddress([element.data?.lendingMarket.toBuffer()], LENDING_PROGRAM_ID)
        
        const ataInfo = await connection.getAccountInfo(destinationCollateral)
        if (!ataInfo) {
            const createAtaIx = createAssociatedTokenAccountInstruction(
                wallet?.publicKey!,
                destinationCollateral,
                wallet?.publicKey!,
                element.data?.collateral.mintPubkey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            instructions.push(createAtaIx);
        }

        const refreshIx = refreshReserveInstruction(element.pubkey!, element.data?.liquidity.oraclePubkey!);
        instructions.push(refreshIx);
        
        const depositReserveIx = depositReserveLiquidityInstruction(
            amount! * Math.pow(10, element.data.liquidity.mintDecimals),
            sourceLiquidity,
            destinationCollateral,
            element.pubkey,
            element.data?.liquidity.supplyPubkey,
            element.data?.collateral.mintPubkey,
            element.data?.lendingMarket,
            lendingMarketAuthority,
            wallet?.publicKey!
        )
        
        instructions.push(depositReserveIx);
        instructions.push(refreshIx);

        const exchangeRate = Number(element.data.collateral.mintTotalSupply) / (Number(element.data.liquidity.availableAmount) + Number(element.data.liquidity.borrowedAmountWads))
        const collateralAmount = amount! * exchangeRate
        // If an obligation account exists, deposit collateral straight up
        const obligation = await PublicKey.createWithSeed(
            wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
        )
        const obligationInfo = await connection.getAccountInfo(obligation)
        if (obligationInfo) {
            const depositObligationCollateralIx: TransactionInstruction = depositObligationCollateralInstruction(
                Math.floor(collateralAmount * Math.pow(10, element.data.liquidity.mintDecimals)),
                destinationCollateral,
                element.data.collateral.supplyPubkey,
                element.pubkey,
                obligation,
                element.data.lendingMarket,
                wallet.publicKey,
                wallet.publicKey
            );
            instructions.push(depositObligationCollateralIx);
            const parsedObligation = parseObligation(obligation, obligationInfo);
            const deposits = parsedObligation?.data.deposits.map((deposit => deposit.depositReserve));
            const borrows = parsedObligation?.data.borrows.map((borrow => borrow.borrowReserve));
            const refreshObligationIx = refreshObligationInstruction(
                obligation,
                deposits!,
                borrows!
            );
            instructions.push(refreshObligationIx);
        }

        if (cleanupInstructions.length > 0) {
            instructions.push(cleanupInstructions[0])
        }
        
        console.log("We depositing it", amount)
        try {
            const instructionGroups: InstructionSet[] = [
                {
                  instructions,
                  signers,
                },
              ];
      
            const sender = SmartInstructionSender.build(
            wallet,
            connection
            )
            .config({
                maxSigningAttempts: MAX_RETRIES,
                abortOnFailure: true,
                commitment: COMMITMENT,
            })
            .withInstructionSets(instructionGroups)
            .onProgress((_ind, txId) => {
                console.log("Transaction sent successfully:", txId);
            })
            .onFailure(failureCallback)
            .onReSign((attempt, i) => {
                const msg = `Resigning: ${i} attempt: ${attempt}`;
                console.warn(msg);
            });

            await sender
            .send()
                .then(() => {
                    console.log("Transaction success");
                    if (callback) {
                        callback();
                    }
                });
        } catch (e) {
            console.log("Error", e)
        }
    }
    
    return (
        <div className="mx-3">
                
            <Button 
                variant="primary"
                onClick={handleShow}
            >Deposit</Button>
            <Toast onClose={() => setShowPopup(false)} show={showPopup} delay={3000} bg='info' autohide>
                <Toast.Header>
                    <strong className="me-auto">Bootstrap</strong>
                    <small>11 mins ago</small>
                </Toast.Header>
                <Toast.Body className="text-white">Deposit processed succesfully!</Toast.Body>
            </Toast>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Enter amount to deposit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <Form.Control 
                            placeholder="Enter amount"
                            type="number"
                            // aria-label="Amount (to the nearest dollar)" 
                            onChange={(event => {
                                setAmount(Number(event.target.value))
                            })}
                            value={amount ? amount : ""}
                        />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => supplyReserve(element)}>
                    Deposit
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
        
    )
}
