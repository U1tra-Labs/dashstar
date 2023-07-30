import { Connection, PublicKey } from '@solana/web3.js';
import { parseLendingMarket } from './src/state/lendingMarket';
import { parseReserve } from './src/state/reserve';

const connection = new Connection('https://api.devnet.solana.com ');

const getMarketData = async () => {
    const lendingMarketPubkey = new PublicKey('7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg')
    const lendingMarketInfo = await connection.getAccountInfo(lendingMarketPubkey)
    const data = parseLendingMarket(lendingMarketPubkey, lendingMarketInfo!)
    console.log(data?.data.owner.toBase58())
    console.log(data?.data.tokenProgramId.toBase58())
    console.log(data?.data.oracleProgramId.toBase58())
    
}
getMarketData()

const getReserveData = async () => {
    const reservePubkey = new PublicKey('5yUyBmzTAus5LGvEEtMdZSDPdP4zLaWCk1szxFkh86VE')
    const reserveInfo = await connection.getAccountInfo(reservePubkey)
    const data = parseReserve(reservePubkey, reserveInfo!)
    console.log(data?.data.lendingMarket.toBase58())
    console.log(data?.data.liquidity)
    console.log("////  Liquidity ////////")
    console.log("Mint pubkey", data?.data.liquidity.mintPubkey.toBase58())
    console.log("Supply pubkey", data?.data.liquidity.supplyPubkey.toBase58())
    console.log("Oracle pubkey", data?.data.liquidity.oraclePubkey.toBase58())
    console.log("Fee receiver", data?.data.liquidity.feeReceiver.toBase58())
    console.log("borrowed amount wads", data?.data.liquidity.borrowedAmountWads.toNumber())
    console.log("cumulative borrowed rate wads", data?.data.liquidity.cumulativeBorrowRateWads.toNumber())
    console.log("Market price", data?.data.liquidity.marketPrice.toNumber())
    console.log("////  Collateral ////////")
    console.log(data?.data.collateral)
    console.log("Mint pubkey", data?.data.collateral.mintPubkey.toBase58())
    console.log("Supply pubkey", data?.data.collateral.supplyPubkey.toBase58())
    console.log(data?.data.config.fees)
    console.log("////  Raw ////////")
    console.log(data?.data)
}
getReserveData()