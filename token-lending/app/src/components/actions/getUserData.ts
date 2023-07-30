import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { COMMITMENT, LENDING_PROGRAM_ID } from '../../utils/constants';
import { OBLIGATION_SIZE, parseObligation } from '../../utils/state';
import { getAssociatedTokenAddress, getMint, getAccount } from '@solana/spl-token';
import { WRAPPED_SOL } from '../../utils/constants';

const connection = new Connection('https://devnet.helius-rpc.com/?api-key=0f8a8423-3f18-414e-b81e-c6cfe5405be0');
const lendingMarketPubkey = new PublicKey('7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg')

export const getObligationData = async (obligationPubkey: PublicKey) => {
    const obligationInfo = await connection.getAccountInfo(obligationPubkey, COMMITMENT)
    const data = parseObligation(obligationPubkey, obligationInfo!)
    return { data }
}

// this will get all reserve accounts for a given lendingMarket pubkey
export const getUserData = async (authority: PublicKey, reservesData: any) => {
    const accounts = await connection.getParsedProgramAccounts(
        LENDING_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: OBLIGATION_SIZE, // number of bytes
                },
                {
                    memcmp: {
                        offset: 1 + 8 + 1 + 32, // number of bytes
                        bytes: authority.toBase58(), // base58 encoded string
                    },
                },
                {
                    memcmp: {
                        offset: 1 + 8 + 1, // number of bytes
                        bytes: lendingMarketPubkey.toBase58(), // base58 encoded string
                    },
                },
            ],
            
        }
      );
      const result = await Promise.all(
        accounts.map((account) =>
            getObligationData(account.pubkey)
        )
      );
      await Promise.all(reservesData.map(async (reserve: any) => {
        const userCollateralAta = await getAssociatedTokenAddress(reserve.data.data.collateral.mintPubkey, authority)
        const collateralMint = await getMint(connection, reserve.data.data.collateral.mintPubkey)
        reserve.decimals = collateralMint.decimals;
        try {    
            const collateralAmount = await getAccount(connection, userCollateralAta)
            reserve.amount = Number(collateralAmount.amount)
            const obligation = await PublicKey.createWithSeed(
                authority, 'obligation', LENDING_PROGRAM_ID
            )
            // Add Amounts from the Obligation account (note will need a way to refresh this data without sending a program instruction)
            const obligationInfo = await connection.getAccountInfo(obligation, COMMITMENT)
            if (obligationInfo) {
                const parsedObligation = parseObligation(obligation, obligationInfo)
                parsedObligation?.data.deposits.map((deposit) => {
                    if (deposit.depositReserve.toBase58() === reserve.data.pubkey.toBase58()) {
                        reserve.amount += Number(deposit.depositedAmount)
                    }
                })
            }
        } catch {
            reserve.amount = 0
            console.log("set amount to 0")
        }
        reserve.sourceCollateral = userCollateralAta;
        try {
            if (reserve.data.data.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
                const balance = await connection.getBalance(authority, COMMITMENT)
                reserve.lAmount = (balance / LAMPORTS_PER_SOL)
            } else {
                const userLiquidityAta = await getAssociatedTokenAddress(reserve.data.data.liquidity.mintPubkey, authority)
                const liquidityMint = await getMint(connection, reserve.data.data.liquidity.mintPubkey)
                const liquidityAmount = await getAccount(connection, userLiquidityAta, COMMITMENT)
                reserve.lAmount = Number(liquidityAmount.amount) / Math.pow(10, liquidityMint.decimals)
            }
            
        } catch {
            reserve.lAmount = 0
        }
        return (reserve)
    }))
    
    
    return { possiblyUserData: result, updatedReservesData: reservesData }
    
}


