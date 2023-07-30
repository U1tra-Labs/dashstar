import { Connection, PublicKey } from '@solana/web3.js';
import { LENDING_PROGRAM_ID } from '../../utils/constants';
import { parseReserve } from '../../utils/state';

const connection = new Connection('https://devnet.helius-rpc.com/?api-key=0f8a8423-3f18-414e-b81e-c6cfe5405be0');
const lendingMarketPubkey = new PublicKey('7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg')

export const getReserveData = async (reservePubkey: PublicKey) => {
    const reserveInfo = await connection.getAccountInfo(reservePubkey)
    const data = parseReserve(reservePubkey, reserveInfo!)
    return { data }
}

// this will get all reserve accounts for a given lendingMarket pubkey
export const getReserveAccounts = async () => {
    const accounts = await connection.getParsedProgramAccounts(
        LENDING_PROGRAM_ID,
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
      const result = await Promise.all(
        accounts.map((account) =>
            getReserveData(account.pubkey)
        )
      );
    return { result }
    
}


