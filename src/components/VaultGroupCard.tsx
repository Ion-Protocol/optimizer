import { VaultGroupItem } from "@/hooks/useDashboard";
import { VaultGroup } from "@/types";
import { Skeleton } from "./ui/skeleton";

interface VaultGroupCardProps {
  vaultGroup: VaultGroupItem;
  loading: boolean;
  onClickExplore: (vaultGroup: VaultGroup) => void;
}

export function VaultGroupCard({ vaultGroup, loading, onClickExplore }: VaultGroupCardProps) {
  return (
    <div className="flex flex-col items-start p-5 gap-6 w-full bg-white border border-[#DFDFDF] rounded-[18px]">
      {/* Header Section */}
      <div className="flex flex-col gap-4 w-[219px]">
        {/* Icon placeholder */}
        <div className="w-12 h-12 bg-[#FF6C15] rounded-[9.39px]" />

        {/* Title and Subtitle */}
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-2xl font-medium leading-[120%] tracking-[-0.02em] text-[#1F180F] m-0">
            {vaultGroup.vaultGroupKey}
          </h3>
          <p className="font-inter text-lg font-normal leading-[130%] tracking-[-0.02em] text-[#4D4D4D] m-0">
            {vaultGroup.vaultGroupKey}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-row gap-3 w-full">
        {/* TVL */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-1.5 m-0">TVL</p>
          {loading ? (
            <Skeleton className="h-[28px] w-[120px]" /> // Match height of text-xl
          ) : (
            <p className="font-mono text-xl font-medium text-[#1F180F] m-0">{vaultGroup.tvl}</p>
          )}
        </div>

        {/* APY */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-1.5 m-0">APY</p>
          {loading ? (
            <Skeleton className="h-[28px] w-[80px]" /> // Match height of text-xl
          ) : (
            <p className="font-mono text-xl font-medium m-0 bg-gradient-to-r from-[#CF5711] to-[#6E2E09] bg-clip-text text-transparent">
              {vaultGroup.apy}
            </p>
          )}
        </div>

        {/* Protocols */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-1.5 m-0">Protocols</p>
          <div className="flex items-center gap-1.5">{/* Protocol icons would go here */}</div>
        </div>
      </div>

      {/* Explore Button */}
      <button
        onClick={() => onClickExplore(vaultGroup.vaultGroupKey)}
        className="w-full py-4 px-4 bg-white border border-[#DFDFDF] rounded-lg flex items-center justify-center gap-2 cursor-pointer font-inter text-base text-[#1F180F]"
      >
        Explore
      </button>
    </div>
  );
}
