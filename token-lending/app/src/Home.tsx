import styled from "@emotion/styled";
import Gradient from "./Gradient";
import { logo } from "./assets";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  useAnchorWallet,
  useConnection,
  AnchorWallet,
} from "@solana/wallet-adapter-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import Loading from "./components/Loading";
import Reserves from "./components/Reserves";
import { parseLendingMarket } from "./utils/state";
import { getReserveAccounts } from "./components/actions/getReserveData";
import { getUserData } from "./components/actions/getUserData";
import { Tabs, Tab } from "react-bootstrap";
import Positions from "./components/Positions";
import * as pyth from "@pythnetwork/client";
import BigNumber from "bignumber.js";
import Navbar from "./Navbar";
import Header from "./components/Header";
import Supply from "./components/Supply";
import { MarketCard1, MarketCard2, MarketCard3 } from "./components/MarketCard";
import AssetCard from "./components/AssetCard";
import { Assets } from "./utils/constants";
import { Switch } from "@headlessui/react";
import VaultInfo from "./components/VaultInfo";
import BorrowObligationLiquidity from "./components/BorrowObligationLiquidity";
import RepayObligationLiquidity from "./components/RepayObligationLiquidity";
const Home: React.FC = () => {
  const wallet = useAnchorWallet() as AnchorWallet;
  const [setWallet] = useState(null); // Implement this
  const { connection } = useConnection();
  const [loading, setLoading] = useState<boolean>(true);
  const [circulatingSupply, setCirculatingSupply] = useState<any>(null);
  const [averageApy, setAverageApy] = useState(null);
  const [usdRate, setUsdRate] = useState(null);
  const [closestApy, setClosestApy] = useState(null); 
  const [netApy, setNetApy] = useState(null);
  const [vaultInfo, setVaultInfo] = useState();
  const [statsData, setStatsData] = useState<any>(null);
  const [enabledAsset, setEnabledAsset] = useState<number | null>(null);
  const [reservesData, setReservesData] = useState<any>(undefined);
  const [userData, setUserData] = useState<any>(undefined);
  const [provider, setProvider] = useState<AnchorProvider | undefined>(
    undefined
  );
  const [price11, setPrice11] = useState('N/A');


  const anchorWallet = useMemo(() => {
    const walletIsLoaded = wallet?.publicKey;

    if (walletIsLoaded) {
      return {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as unknown as typeof anchor.Wallet;
    }
  }, [wallet]);

  const refetchMarkets = useCallback(async () => {
    if (wallet && anchorWallet) {
      console.log("Loading Ultra info");
      setLoading(true);
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      );
      setProvider(provider);

      console.log("Init Pubkey Data");

      const lendingMarketPubkey = new PublicKey(
        "7T12b6nyt6vbgj1rvaW2PVvicTvsrdSY5YNNSchGTqLg"
      );

      console.log("Init Lending Market Info");

      const lendingMarketInfo = await connection.getAccountInfo(
        lendingMarketPubkey
      );

      console.log("Get Reserve accounts");

      const possiblyReservesData = await getReserveAccounts();

      console.log("Load Pyth Client");

      const pythClient = new pyth.PythHttpClient(
        connection,
        pyth.getPythProgramKeyForCluster("devnet")
      );

      console.log("Get Pyth Data");

      const data = await pythClient.getData();

      console.log("Locate Oracle ID");

      const oracleIds = possiblyReservesData.result.map((reserve) =>
        reserve.data?.data.liquidity.oraclePubkey.toBase58()
      );
      const filtered = data.products.filter((product) =>
        oracleIds.includes(product.price_account)
      );
      possiblyReservesData.result.forEach((reserve) => {
        const symbol = filtered.filter(
          (product) =>
            product.price_account ===
            reserve.data?.data.liquidity.oraclePubkey.toBase58()
        )[0].symbol;
        const price = data.productPrice.get(symbol)!.price;
        reserve!.data!.data.liquidity.marketPrice = new BigNumber(price!);
      });

      console.log("Updating Reserve Data");
      const { possiblyUserData, updatedReservesData } = await getUserData(
        wallet.publicKey,
        possiblyReservesData.result
      );
      if (possiblyUserData.length > 0) {
        setUserData(possiblyUserData);
      } else {
        console.log("No user obligation account");
        setUserData([]);
      }

      if (possiblyReservesData) {
        setReservesData(updatedReservesData);
        // Code below to refresh reserve data

        // for (let i=0; i<possiblyReservesData.result.length; i++) {
        //   console.log(possiblyReservesData.result[i].data?.pubkey.toBase58())
        //   const refreshIx = refreshReserveInstruction(possiblyReservesData.result[i].data?.pubkey!, possiblyReservesData.result[i].data?.data.liquidity.oraclePubkey!)

        //   await provider.sendAndConfirm(new Transaction().add(refreshIx), [])
        //   console.log(refreshIx)
        //   console.log("Oracle", possiblyReservesData.result[i].data?.data.liquidity.oraclePubkey.toBase58())
        //   console.log(possiblyReservesData.result[i].data?.data.liquidity.marketPrice.toNumber())
        // }
      }
      console.log("Here it is:", possiblyReservesData.result[0].data?.data);
      //   const program = await loadProgram(connection, anchorWallet);
      //   setAnchorProgram(program);
      setLoading(false);
    }
  }, [anchorWallet, connection, wallet]);

  // Existing imports
  
  useEffect(() => {
    refetchMarkets();
  }, [refetchMarkets]);
  
  const connect = () => {
    return <div></div>;
  };

  useEffect(() => {
    fetch('https://api.solend.fi/v1/circulating-supply')
      .then(response => response.json())
      .then(data => {
      console.log('Supply Data:', data);
      setCirculatingSupply(data);
    })
      .catch(error => console.error('Error fetching supply data:', error));

    fetch('https://api.solend.fi/stats')
    .then(response => response.json())
    .then(data => {
      console.log('Stats Data:', data);
      setStatsData(data);
    })
    .catch(error => console.error('Error fetching stats data:', error));
  }, []);

  useEffect(() => {
    fetch('https://merv2-api.mercurial.finance/vault_info')
      .then(response => response.json())
      .then(data => {
        console.log('APY Data:', data);
        setAverageApy(data.average_apy);
        setUsdRate(data.usd_rate);
        setClosestApy(data.closest_apy);
        setNetApy(data.net_apy);


      const usdcVault = data.find((vault: any) => vault.token_name === 'USDC');
      if (usdcVault) {
        setPrice11(usdcVault.virtual_price);
      }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  


  const MarketEntry = (element: any, index: number) => {
    if (!element) {
      console.warn('Undefined element', {element, index});
      return null;
    }
  }
  
  const CirculatingSupplyMarketEntry = () => {
    if (!circulatingSupply || !circulatingSupply) {
      return null;  // or some placeholder while loading data
    };
    
      
    // Handle logic for vaultInfo here
    // ...
  }
  
  const VaultMarketEntry = () => {
    if (!vaultInfo) {
      return null;  // or some placeholder while loading data
    };

    let price1 = statsData.average_apy || 'N/A';
    let price2 = statsData.usd_rate || 'N/A';
    let price3 = statsData.closest_apy || 'N/A';
    let price4 = statsData.netApy || 'N/A';
  
    // Handle logic for vaultInfo here
    // ...
  }
  
  const StatsMarketEntry = () => {
    if (!statsData) {
      return null;  // or some placeholder while loading data
    }
   
    let price1 = statsData.totalBorrowsUSD || 'N/A';
    let price2 = statsData.totalDepositsUSD || 'N/A';
    let price3 = statsData.totalMarkets || 'N/A';
    let price4 = statsData.totalObligations || 'N/A';
    let price5 = circulatingSupply || 'N/A';
    let price6 = averageApy || 'N/A';
    let price7 = statsData.usd_rate || 'N/A';
    let price8 = 'N/A';
    let price9 = statsData.totalFeesUSD ||'N/A';
    let price10 = 'N/A';
    let price11 = closestApy || 'N/A';
    let price12 = netApy ||'N/A';

    
    return (
      <>
        <MarketCard1
          title={`Market Overview`}
          heading1="totalBorrowsUSD"
          price1={price1}
          heading2="totalDepositsUSD"
          price2={price2}
          heading3="totalObligations"
          price3={price3}
          heading4="totalMarkets"
          price4={price4}
        />
          <MarketCard2
        title2="Balances"
        heading5="Circulating Supply"
        price5={price5}
        heading6="Total Supply"
        price6="0"
        heading7="Protocol TVL"
        price7="0"
        heading8="Protocol Fees"
        price8={price9}
      />
        {/* Create new MarketCards for the remaining data */}
        <MarketCard3
        title3="APY"
        heading9="Average APY"
        price9={price6}
        heading10="USDC Rate"
        price10="1"
        heading11="Closest APY"
        price11={price11}
        heading12="Net APY"
        price12={price12}
/>
      </>
    )
  }

return (
  <div className="bg-[#1C2442] min-h-screen text-white bg-hero-pattern bg-cover bg-no-repeat overflow-x-hidden ">
    <Header />
    <div className="mx-[167px] w-full">

      {!loading ? (
        <>
          <Supply
            reservesData={reservesData}
            userData={userData}
            provider={provider}
            callback={refetchMarkets}
          />


          <div className="flex mt-[20px] flex-col">
            <h1 className="text-2xl">Market</h1>
            <div className="flex flex-wrap gap-12 mt-7 items-start">
              {userData.map((data, index) => MarketEntry(data, index))}
              {CirculatingSupplyMarketEntry()}
              {StatsMarketEntry()}
              {VaultMarketEntry()} 
            </div>
          </div>

          <div className="flex flex-wrap my-6 gap-6 mt-7 items-start">
            <AssetCard title="Supply Market" data={Assets} />
            <AssetCard title="Borrow Market" data={Assets} isLiquidity />
          </div>
        </>
      ) : (
        !wallet ? connect() : <div>Loading...</div> // Placeholder, need to replace with your actual Loading component
      )}
    </div>
  </div>
);
}; 


const ParentComponent = () => {
  const [enabledAsset, setEnabledAsset] = useState<number | null>(null);
  
  const toggleSwitch = (id: number) => {
    console.log(`Toggle switch called with id: ${id}`);
    setEnabledAsset(prevEnabledAsset => prevEnabledAsset === id ? null : id);
  };
  
  // Define your data here
  const assets = [
    // Your data objects
  ];

  const AssetEntry = (asset: any, index: number) => {
    return (
      <tr key={index}>
        <td>{asset.name}</td>
        <td>{asset.amount}</td>
        <td>{asset.apy}</td>
        <td>{asset.liquidity}</td>
        <td>{asset.short}</td>
        <td>
          <Switch.Group as="div" className="flex items-center">
            <Switch
              checked={enabledAsset === asset.id}
              onChange={() => toggleSwitch(asset.id)}
              className={`${
                enabledAsset === asset.id
                  ? "bg-[#1C2442] borders"
                  : "bg-[#1C2442] border border-gray-800"
              } relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <span className="sr-only">Toggle Asset</span>
              <span
                aria-hidden="true"
                className={`${
                  enabledAsset === asset.id
                    ? "translate-x-9 bg-gradient-to-r from-[#9945ff] to-[#14f915]"
                    : "translate-x-0 bg-gray-600"
                } pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </Switch.Group>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <AssetCard 
        title="Your Title" // replace with your title
        data={assets} 
        isLiquidity={true} // replace with your value
        enabledAsset={enabledAsset} 
        toggleSwitch={toggleSwitch} 
      />
    </div>
  );
};





const Body = styled.div`
  width: 95vw;
  margin: 20px;
`;

const SocialLink = styled.a`
  color: white;
  :hover {
    color: var(--color-accent-active);
  }
`;

const WalletDisconnectButtonStyled = styled(WalletDisconnectButton)`
  background: black;
  color: white;
  height: 40px;
  justify-content: center;
  border-radius: 9px;
  padding: 5px;
  min-width: 150px;
  :not([disabled]):hover {
    background: #d42fb8;
  }
  i {
    display: none;
  }
`;

const WalletMultiButtonStyled = styled(WalletMultiButton)`
  background: blue;
  color: white;
  height: 40px;
  justify-content: center;
  border-radius: 9px;
  padding: 5px;
  min-width: 150px;
  :not([disabled]):hover {
    background: #d42fb8;
  }
  i {
    display: none;
  }
`;

const Title = styled.div`
  color: white;
  font-weight: bold;
  font-size: 24px;
`;

export default Home;