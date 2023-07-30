import { PublicKey } from "@solana/web3.js";
import { OBLIGATION } from "./constants";


export const findObligationKey = async (
    lendingMarket: PublicKey,
    user: PublicKey,
    programId: PublicKey
  ): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
      [OBLIGATION, lendingMarket.toBuffer(), user.toBuffer()],
      programId
    );
  };

// create a getUserData function that loops through each reserve and calculates how much 
// of the collateral mint they have
// then multiple it by market price to get value in USD
// Sum over all positions

// Would need to also update collateral deposits with any deposits that aren't registered