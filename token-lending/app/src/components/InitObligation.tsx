
import { AnchorWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Form, Container } from "react-bootstrap";
import { lendingMarketPubkey, LENDING_PROGRAM_ID, MAX_RETRIES, COMMITMENT } from "../utils/constants";
import { 
    depositObligationCollateralInstruction, 
    initObligationInstruction,  
    refreshReserveInstruction } from "../utils/instructions";
import { InstructionSet, SmartInstructionSender } from '@holaplex/solana-web3-tools';
import { TransactionInstruction, SystemProgram, PublicKey,  } from "@solana/web3.js";
import { useSmartSender } from "../utils/hooks";
import { OBLIGATION_SIZE } from "../utils/state";
import { useEffect, useState } from "react";


export default function InitObligation({
    reserve,
    callback
}: {
    reserve: any;
    callback?: () => Promise<void>;
}) {
    const wallet = useAnchorWallet() as AnchorWallet;
    const { connection } = useConnection();
    const { failureCallback } = useSmartSender();
    const [disabled, setDisabled] = useState<boolean>(false);
    
    const initObligation = async () => {
        const obligation = await PublicKey.createWithSeed(
            wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
        )
        const obligationCheck = await connection.getAccountInfo(obligation)
        const instructions: TransactionInstruction[] = [];
        // Eventually will need to check whether an obligation account has 10 token deposits
        if (!obligationCheck) {
            console.log("Initialising obligation for account", obligation.toBase58())
            const lamports = await connection.getMinimumBalanceForRentExemption(OBLIGATION_SIZE)
            
            const createAccoutIx = SystemProgram.createAccountWithSeed({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: obligation,
                basePubkey: wallet.publicKey,
                seed: 'obligation',
                lamports,
                space: OBLIGATION_SIZE,
                programId: LENDING_PROGRAM_ID
            });
            instructions.push(createAccoutIx);
        
            const initObligationIx: TransactionInstruction = initObligationInstruction(
                obligation,
                lendingMarketPubkey,
                wallet?.publicKey!
            )
            instructions.push(initObligationIx)
        }

        const refreshIx = refreshReserveInstruction(reserve.data.pubkey!, reserve.data?.data.liquidity.oraclePubkey!);
        instructions.push(refreshIx);
        // deposit collateral
        console.log(reserve.data.pubkey.toBase58())
        const depositObligationCollateralIx: TransactionInstruction = depositObligationCollateralInstruction(
            reserve.amount,
            reserve.sourceCollateral,
            reserve.data.data.collateral.supplyPubkey,
            reserve.data.pubkey,
            obligation,
            reserve.data.data.lendingMarket,
            wallet.publicKey,
            wallet.publicKey
        )
        instructions.push(depositObligationCollateralIx)
        console.log(instructions)
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
            console.log(wallet.publicKey)
        }
    }

    useEffect(() => {
        if (wallet) {
            const obligation = PublicKey.createWithSeed(
                wallet.publicKey, 'obligation', LENDING_PROGRAM_ID
            )
            
            Promise.resolve(obligation).then(
                res => Promise.resolve(connection.getAccountInfo(res)).then(
                    val => setDisabled(val?.lamports! > 0)
                )
            )
        }
    }, [wallet])
        
    
    return (
        <Container>
            <Form style={{"display":"flex", "justifyContent":"center"}}>
                <Form.Check 
                    type="switch"
                    checked={disabled}
                    id="custom-switch"
                    label={disabled ? "Account set up for borrowing" : "Set up account for borrowing"}
                    onChange={() => initObligation()}
                    disabled={disabled}
                />
            </Form>
        </Container>
    )
}