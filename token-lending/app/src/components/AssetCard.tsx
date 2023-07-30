import React from "react";
import AssetSwitch from './AssetSwitch';

type Prop = {
  title: string;
  data: {
    image: any;
    name: string;
    apy: number;
    amount: number;
    short: string;
    id: number;
  }[];
  isLiquidity?: boolean;
  enabledAsset: number | null;
  toggleSwitch: (id: number) => void;
};

const AssetCard = ({ title, data, isLiquidity, enabledAsset, toggleSwitch }: Prop) => {
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
                      <AssetSwitch enabledAsset={enabledAsset} item={item} toggleSwitch={toggleSwitch} />
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
