import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import InitObligation from "./InitObligation";
import SupplyReserveLiquidity from "./SupplyReserveLiquidity";
import BorrowObligationLiquidity from "./BorrowObligationLiquidity";
import RepayObligationLiquidity from "./RepayObligationLiquidity";
import WithdrawObligationCollateral from "./WithdrawObligationCollateral";
import { AnchorProvider } from "@project-serum/anchor";
import Positions from "./Positions";


const AssetCard = ({ title, data, isLiquidity, provider, callback }: Prop) => {
  const [enabledAssets, setEnabledAssets] = useState<number[]>([]);

  const toggleSwitch = (assetId: number) => {
    setEnabledAssets((prevAssets) => {
      if (prevAssets.includes(assetId)) {
        return prevAssets.filter((id) => id !== assetId);
      } else {
        return [...prevAssets, assetId];
      }
    });
  };

  return (
    <div className="flex flex-col items-start">
      <div className="relative">
        <img src={require("../assets/Rectangle 36.png")} alt="react" />
        <span className="absolute top-2 left-3 items-center justify-center">
          {title}
        </span>
      </div>
      <div className=" w-[538px] h-[635px]">
        <table className="border bg-gradient-to-r container">
          <thead className="cardborder-content h-[53px] items-start">
            <tr className="">
              <th className="text-start px-2 text-[16px] font-semibold">
                Asset
              </th>
              <th className="text-start px-2 text-[16px] font-semibold">APY</th>
              <th className="text-start px-2 text-[16px] font-semibold">
                Wallet
              </th>
              <th className="text-start px-2 text-[16px] font-semibold">
                {isLiquidity ? "Liquidity" : "Collateral"}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id} className="w-full border-b-2 border-blue-500">
                <td className="flex px-4 py-2.5 items-center space-x-12">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-[42px] h-[42px] rounded-full object-contain"
                  />
                  <span  className="text-start px-2 text-[15px] font-medium">{item.name}</span>
                </td>
                <td>{item.apy}%</td>
                <td className="text-start px-2 text-[15px] font-medium">
                  {item.amount} {item.short}
                </td>
                <td className="">
                  {isLiquidity && <div className="text-start px-2 text-[15px] font-medium">${item.liquidity}M</div>}
                  {!isLiquidity && (
                    <div>
<Switch
  checked={enabledAssets.includes(item.id)}
  onChange={() => {
    if (enabledAssets.includes(item.id)) {
      console.log(`Switch with ID ${item.id} toggled OFF`);
    } else {
      console.log(`Switch with ID ${item.id} toggled ON`);
    }
    toggleSwitch(item.id);
  }}
  className={`${
    enabledAssets.includes(item.id)
      ? "bg-[#1C2442] borders"
      : "bg-[#1C2442] border border-gray-800"
  } relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
>
  <span className="sr-only">Use setting</span>
  <span
    aria-hidden="true"
    className={`${
      enabledAssets.includes(item.id)
        ? "translate-x-9 bg-gradient-to-r from-[#9945ff] to-[#14f915]"
        : "translate-x-0 bg-gray-600"
    }
    pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
  />
</Switch>

                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetCard;
