import { 
    refreshReserveInstruction, 
    refreshObligationInstruction, 
    repayObligationLiquidityInstruction
} from "../utils/instructions";
import { Button, Modal, InputGroup, Form, Toast } from "react-bootstrap";
import { useState } from "react";
import { AnchorProvider } from "@project-serum/anchor";
import { 
    LAMPORTS_PER_SOL, 
    PublicKey, 
    TransactionInstruction,
    Signer,
    Keypair,
    SystemProgram
} from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, 
    TOKEN_PROGRAM_ID, 
    createCloseAccountInstruction,
    getMinimumBalanceForRentExemptAccount, 
    ACCOUNT_SIZE,
    createInitializeAccountInstruction
} from "@solana/spl-token";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { LENDING_PROGRAM_ID, WRAPPED_SOL } from "../utils/constants";
import { SmartInstructionSender, InstructionSet } from "@holaplex/solana-web3-tools";
import { useSmartSender } from '../utils/hooks';
import { COMMITMENT, MAX_RETRIES } from "../utils/constants";
import { parseObligation } from "../utils/state";

export default function RepayObligationLiquidity({
    borrowObligation,
    reserve,
    callback,
    provider
}: {
    borrowObligation: any;
    reserve: any;
    callback?: () => Promise<void>;
    provider: AnchorProvider;
}) {
    const [show, setShow] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [amount, setAmount] = useState<number | undefined>(undefined);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const { connection } = useConnection();
    const wallet = useAnchorWallet() as AnchorWallet;
    const { failureCallback } = useSmartSender();

    const repayObligation = async(element: any, reserve: any) => {

        const obligation = await PublicKey.createWithSeed(
            wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
        )
        console.log("Liquidity supply pubkey", reserve.data.liquidity.feeReceiver.toBase58())
        const obligationInfo = await connection.getAccountInfo(obligation)
        const parsedObligation = parseObligation(obligation, obligationInfo!);

        const instructions: TransactionInstruction[] = [];
        const signers: Signer[] = [];
        let sourceLiquidity: PublicKey; 
        if (reserve.data?.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
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
                reserve.data?.liquidity.mintPubkey,
                wallet.publicKey,
                TOKEN_PROGRAM_ID
            );
            instructions.push(initializeWrappedSolAccIx);
        } else {
            sourceLiquidity = await getAssociatedTokenAddress(reserve.data?.liquidity.mintPubkey, wallet.publicKey!);
        };

        const refreshIx = refreshReserveInstruction(reserve.pubkey!, reserve.data?.liquidity.oraclePubkey!);
        instructions.push(refreshIx);

        const deposits = parsedObligation?.data.deposits.map((deposit => deposit.depositReserve));
        const borrows: PublicKey[] | undefined = parsedObligation?.data.borrows.map((borrow => borrow.borrowReserve));
        
        const refreshObligationIx = refreshObligationInstruction(
            obligation,
            deposits!,
            borrows!
        );
        instructions.push(refreshObligationIx)
        
        const repayObligationIx = repayObligationLiquidityInstruction(
            amount! * Math.pow(10, reserve.data.liquidity.mintDecimals),
            sourceLiquidity,
            reserve.data.liquidity.supplyPubkey,
            reserve.pubkey,
            obligation,
            reserve.data.lendingMarket,
            wallet.publicKey
        )
        
        instructions.push(repayObligationIx);
        instructions.push(refreshIx);
        const exists = borrows?.some(pubkey => pubkey.toBase58() === reserve.pubkey.toBase58())
        if (!exists) {
            borrows!.push(element.pubkey)
            console.log(borrows)
        }
        
        const refreshObligationIx2 = refreshObligationInstruction(
            obligation,
            deposits!,
            borrows!
        );
        instructions.push(refreshObligationIx2);
        if (element.data?.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
            
            instructions.push(
                createCloseAccountInstruction(
                    sourceLiquidity,
                    wallet.publicKey,
                    wallet.publicKey,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );
        }
        console.log("We repaying it", amount)

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
            >Repay</Button>
            <Toast onClose={() => setShowPopup(false)} show={showPopup} delay={3000} bg='info' autohide>
                <Toast.Header>
                    <strong className="me-auto">Bootstrap</strong>
                    <small>11 mins ago</small>
                </Toast.Header>
                <Toast.Body className="text-white">Repay processed succesfully!</Toast.Body>
            </Toast>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Enter amount to repay</Modal.Title>
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
                <Button variant="primary" onClick={() => repayObligation(borrowObligation, reserve)}>
                    Repay
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
        
    )
}
