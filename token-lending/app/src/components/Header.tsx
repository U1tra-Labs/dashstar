import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { logo } from "../assets";

const styles = {
  wrapper:
    "flex w-full items-center justify-around px-9 py-2.5 bg-[#151726] drop-shadow-lg shadow-[#151C36]",
};

const Header = () => {
  // Define the network for the wallet adapter
  const network = WalletAdapterNetwork.Devnet;
  const [isOpen, setIsOpen] = useState(false);

  const truncate = (longString: string, limit = 10) => {
    if (longString.length > limit) {
      return longString.substring(0, limit) + "...";
    }

    return longString;
  };

  const links = [
    {
      name: "Product",
      link: "/",
    
    },
  ];

  const { connected, publicKey } = useWallet();
  const truncatedPublicKey = publicKey ? truncate(publicKey.toString()) : "";
  return (
    <nav className={styles.wrapper}>
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="logo"
          className="w-[48px] h-[48px] object-contain"
        />
        <span className="font-normal text-[20px] bg-gradient-to-r from-[#9945ff] to-[#14f915] bg-clip-text text-transparent">
          Ultra
        </span>
      </div>

      <div className="md:flex hidden items-center space-x-4">
        <button className="button">
          <span className="bg-gradient-to-r from-[#9945ff] to-[#14f915] bg-clip-text text-transparent text-[15px] font-medium">
            Solana
          </span>
        </button>
        <WalletMultiButton className="bg-gradient-to-r  from-[#9945ff] to-[#14f915] !rounded-full">
          <span className="text-sm font-semibold ">
            {connected ? truncatedPublicKey : "Launch App"}
          </span>
        </WalletMultiButton>
      </div>

      <div className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <AiOutlineClose size={28} />
        ) : (
          <HiMenuAlt2 size={28} color="white" className="md:hidden block" />
        )}
      </div>

      {isOpen && (
        <div className="fixed top-0 left-0 right-0 w-screen h-[400px] bg-black">
          <div className="flex flex-col items-start space-y-[20px] mx-9 my-9 space-xy-7">
            {links.map((route, i) => (
              <div className="text-xl">
                <span>{route.name}</span>
                <WalletMultiButton className="bg-gradient-to-r mt-6 from-[#9945ff] to-[#14f915] !rounded-full">
                  <span className="text-sm font-semibold ">
                    {connected ? truncatedPublicKey : "Launch App"}
                  </span>
                </WalletMultiButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
