import { 
    refreshReserveInstruction, 
    refreshObligationInstruction, 
    withdrawObligationCollateralInstruction,
    redeemReserveCollateralInstruction
} from "../utils/instructions";
import { Button, Modal, InputGroup, Form, Toast } from "react-bootstrap";
import { useState } from "react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction, 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    createCloseAccountInstruction, 
    getMint
} from "@solana/spl-token";
import { useConnection, useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { LENDING_PROGRAM_ID, WRAPPED_SOL } from "../utils/constants";
import { SmartInstructionSender, InstructionSet } from "@holaplex/solana-web3-tools";
import { useSmartSender } from '../utils/hooks';
import { COMMITMENT, MAX_RETRIES } from "../utils/constants";
import { parseObligation } from "../utils/state";

export default function WithdrawObligationCollateral({
    element,
    callback
}: {
    element: any;
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

    const calculateMax = async(element: any) => {
        const obligation = await PublicKey.createWithSeed(
            wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
        )
        const obligationInfo = await connection.getAccountInfo(obligation)
        const parsedObligation = parseObligation(obligation, obligationInfo!);

        const maxWithdrawValue = (parsedObligation!.data.allowedBorrowValue.toNumber() - parsedObligation!.data.borrowedValue.toNumber()) / (element.data.config.loanToValueRatio / 100)
        const maxWithdrawalUnits = maxWithdrawValue / element.data.liquidity.marketPrice
        setAmount(maxWithdrawalUnits)
    }

    const withdrawObligation = async(element: any) => {
        const obligation = await PublicKey.createWithSeed(
            wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
        )
        const obligationInfo = await connection.getAccountInfo(obligation)
        const parsedObligation = parseObligation(obligation, obligationInfo!);
        
        const collateralMint = await getMint(connection, element.data.collateral.mintPubkey)

        const instructions: TransactionInstruction[] = [];
        const refreshIx = refreshReserveInstruction(element.pubkey!, element.data?.liquidity.oraclePubkey!);
        instructions.push(refreshIx);
        
        const deposits = parsedObligation?.data.deposits.map((deposit => deposit.depositReserve));
        const borrows: PublicKey[] | undefined = parsedObligation?.data.borrows.map((borrow => borrow.borrowReserve));
        
        const refreshObligationIx = refreshObligationInstruction(
            obligation,
            deposits!,
            borrows!
        );
        instructions.push(refreshObligationIx);

        const [lendingMarketAuthority] = await PublicKey.findProgramAddress([element.data?.lendingMarket.toBuffer()], LENDING_PROGRAM_ID)
        
        const destinationCollateral = await getAssociatedTokenAddress(element.data?.collateral.mintPubkey, wallet.publicKey!);
        const destinationCollateralInfo = await connection.getAccountInfo(destinationCollateral)
        if (!destinationCollateralInfo) {
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

        const withdrawCollateralIx = withdrawObligationCollateralInstruction(
            Math.floor(amount! * Math.pow(10, collateralMint.decimals)),
            element.data.collateral.supplyPubkey,
            destinationCollateral,
            element.pubkey, // borrowReserve
            obligation,
            element.data?.lendingMarket,
            lendingMarketAuthority,
            wallet?.publicKey!
        )
        
        instructions.push(withdrawCollateralIx);
        instructions.push(refreshIx);
        
        const destinationLiquidity = await getAssociatedTokenAddress(element.data?.liquidity.mintPubkey, wallet.publicKey!);
        const destinationLiquidityInfo = await connection.getAccountInfo(destinationLiquidity)
        if (!destinationLiquidityInfo) {
            const createAtaIx = createAssociatedTokenAccountInstruction(
                wallet?.publicKey!,
                destinationLiquidity,
                wallet?.publicKey!,
                element.data?.liquidity.mintPubkey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            instructions.push(createAtaIx);
        }

        const redeemReserveCollateralIx = redeemReserveCollateralInstruction(
            Math.floor(amount! * Math.pow(10, collateralMint.decimals)),
            destinationCollateral,
            destinationLiquidity,
            element.pubkey,
            element.data.collateral.mintPubkey,
            element.data.liquidity.supplyPubkey,
            element.data?.lendingMarket,
            lendingMarketAuthority,
            wallet?.publicKey
        )

        instructions.push(redeemReserveCollateralIx);
        instructions.push(refreshIx);
        instructions.push(refreshObligationIx);
        
        if (element.data?.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
            
            instructions.push(
                createCloseAccountInstruction(
                    destinationLiquidity,
                    wallet.publicKey,
                    wallet.publicKey,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );
        }
        console.log("We withdrawing it", amount)

        try {
            const instructionGroups: InstructionSet[] = [
                {
                  instructions,
                  signers: [],
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
            >Withdraw</Button>
            <Toast onClose={() => setShowPopup(false)} show={showPopup} delay={3000} bg='info' autohide>
                <Toast.Header>
                    <strong className="me-auto">Bootstrap</strong>
                    <small>11 mins ago</small>
                </Toast.Header>
                <Toast.Body className="text-white">Withdraw processed succesfully!</Toast.Body>
            </Toast>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Enter amount to withdraw</Modal.Title>
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
                        <Button 
                            variant='outline-dark'
                            onClick={() => calculateMax(element)}
                        >
                            MAX
                        </Button> 
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => withdrawObligation(element)}>
                    Withdraw
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
        
    )
}
