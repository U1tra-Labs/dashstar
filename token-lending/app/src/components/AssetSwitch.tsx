import React from "react";
import { Switch } from "@headlessui/react";

interface AssetSwitchProps {
  enabledAsset: number | null;
  item: { id: number; [key: string]: any };
  toggleSwitch: (id: number) => void;
}

const AssetSwitch: React.FC<AssetSwitchProps> = ({ enabledAsset, item, toggleSwitch }) => {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabledAsset === item.id}
        onChange={() => toggleSwitch(item.id)}
        className={`${
          enabledAsset === item.id
            ? "bg-[#1C2442] borders"
            : "bg-[#1C2442] border border-gray-800"
        } relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${
            enabledAsset === item.id
              ? "translate-x-9 bg-gradient-to-r from-[#9945ff] to-[#14f915]"
              : "translate-x-0 bg-gray-600"
          } pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </Switch.Group>
  );
};

export default AssetSwitch;

