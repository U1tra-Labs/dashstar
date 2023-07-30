import { Connection, PublicKey } from '@solana/web3.js';
import { parseLendingMarket } from './src/state/lendingMarket';
import { parseReserve } from './src/state/reserve';

const connection = new Connection('https://api.devnet.solana.com');
const lendingMarketPubkey = new PublicKey('7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg')

const getReserveData = async (reservePubkey: PublicKey) => {
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

// this will get all reserve accounts for a given lendingMarket pubkey
const getProgramAccounts = async () => {
    const accounts = await connection.getParsedProgramAccounts(
        new PublicKey("HCHiaAK26t9MFTj933s3Te71NGpwgb6Lbuev7q6phaSL"),
        {
            filters: [
                {
                    dataSize: 571, // number of bytes
                },
                {
                    memcmp: {
                        offset: 10, // number of bytes
                        bytes: lendingMarketPubkey.toBase58(), // base58 encoded string
                    },
                },
            ],
        }
      );
    accounts.forEach(account => getReserveData(account.pubkey))
    
}
getProgramAccounts()

