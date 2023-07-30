import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import axios from "axios";

export const COMMITMENT = "confirmed";
export const RPC_TIMEOUT = 120 * 1000;
export const LENDING_PROGRAM_ID = new PublicKey("HCHiaAK26t9MFTj933s3Te71NGpwgb6Lbuev7q6phaSL");
export const ORACLE_PROGRAM_ID = new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');
export const MAX_RETRIES = 3;

export const OBLIGATION = Buffer.from("obligation");
export const lendingMarketPubkey = new PublicKey('7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg');
export const WRAPPED_SOL = 'So11111111111111111111111111111111111111112';


export const Assets = [
    {
      image: require("../assets/Avalanche 2.png"),
      name: "Avalanche",
      apy: 0,
      amount: 0,
      short: "AVAX",
      id: 1,
      liquidity: 0
    },
    {
      image: require("../assets/ethereum-symbol 1.png"),
      name: "Ethereum",
      apy: 0,
      amount: 0,
      short: "ETH",
      id: 2,
      liquidity: 0
    },
    {
      image: require("../assets/sol.png"),
      name: "Solana",
      apy: 0,
      amount: 0,
      short: "SOL",
      id: 3,
      liquidity: 0
    },
    {
      image: require("../assets/Bitcoin 1.png"),
      name: "Bitcoin",
      apy: 0,
      amount: 0,
      short: "BTC",
      id: 4,
      liquidity: 0
    },
    {
      image: require("../assets/neon.jpg"),
      name: "Neon",
      apy: 0,
      amount: 0,
      short: "NEON",
      id: 5,
      liquidity: 0

    },
    {
      image: require("../assets/USDC 1.png"),
      name: "USDC",
      apy: 0,
      amount: 0,
      short: "USDC",
      id: 6,
      liquidity: 0
    },
  ];

  

  