import { getEthPrice, getRate, getTotalSupply, getVaultByKey, VaultKey } from "@molecular-labs/nucleus";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { fetchVaultAPY } from "../../api/nucleus";
import { vaultGroupsConfig } from "../../config/vaultGroupsConfig";
import { VaultGroup } from "../../types";
import { DashboardContextType, VaultGroupState } from "./dashboardTypes";

/////////////////////////////////////
// Async functions for dashboard
/////////////////////////////////////

// Get the total supply for a vault on a specific chain
async function getTotalSupplyByVaultAndChain(vaultKey: VaultKey, chain: Chain) {
  const vaultConfig = getVaultByKey(vaultKey);
  const vaultAddress = vaultConfig.token.addresses[chain.id as keyof typeof vaultConfig.token.addresses] ?? "0x";
  const totalSupply = await getTotalSupply({ tokenAddress: vaultAddress, chain });
  return totalSupply;
}

// Get the share rate for a vault on a specific chain
async function getShareRateByVault(vaultKey: VaultKey) {
  const vaultConfig = getVaultByKey(vaultKey);
  const accountantAddress = vaultConfig.contracts.accountant;
  const rate = await getRate({ accountantAddress, chain: mainnet });
  return rate;
}

// Get the total supply for a vault on all chains
async function getTotalSupplyByVault(vaultKey: VaultKey) {
  const vaultConfig = getVaultByKey(vaultKey);
  const chains = Object.values(vaultConfig.deposit.sourceChains);
  const promises = chains.map((chain) => getTotalSupplyByVaultAndChain(vaultKey, chain));
  const results = await Promise.all(promises);
  return results.reduce((acc, supply) => acc + supply, BigInt(0));
}

// Get the TVL for a vault by multiplying the total supply of that vault by the share rate for that vault
async function getTvlByVault(vaultKey: VaultKey) {
  const vaultTotalSupply = await getTotalSupplyByVault(vaultKey);
  const vaultShareRate = await getShareRateByVault(vaultKey);
  const tvl = (vaultTotalSupply * vaultShareRate) / BigInt(1e18);
  return tvl;
}

// Get the TVL for a vault group by summing the TVLs of all the vaults in the group
async function getTvlByVaultGroup(vaultGroup: VaultGroup) {
  const vaultGroupConfig = vaultGroupsConfig[vaultGroup];
  const vaultTvls = await Promise.all(vaultGroupConfig.vaults.map(getTvlByVault));
  const totalTvl = vaultTvls.reduce((acc, tvl) => acc + tvl, BigInt(0));
  return totalTvl;
}

// Get the APY for a vault group by getting the highest APY of any of the vaults in the group
async function getApyByVaultGroup(vaultGroup: VaultGroup) {
  const vaultGroupConfig = vaultGroupsConfig[vaultGroup];
  const vaultApys = await Promise.all(
    vaultGroupConfig.vaults.map(async (vaultKey) => {
      const vaultConfig = getVaultByKey(vaultKey);
      const { apy } = await fetchVaultAPY({
        tokenAddress: vaultConfig.token.addresses[mainnet.id as keyof typeof vaultConfig.token.addresses] ?? "0x",
      });
      return apy;
    })
  );

  // The APY for a vault group is the highest APY of any of the vaults in the group
  const vaultGroupApy = Math.max(...vaultApys);
  return vaultGroupApy;
}

/////////////////////////////////////
// Dashboard Context
/////////////////////////////////////

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  //////////////////
  // Raw state
  //////////////////
  const [vaultGroupState, setVaultGroupState] = useState<VaultGroupState[]>([]);
  const [ethPrice, setEthPrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

  //////////////////
  // Hooks
  //////////////////

  //////////////////
  // Derived state
  //////////////////

  // Total TVL in USD: derived from the sum of the TVL values of all vault groups
  const totalTvl = useMemo(() => {
    const totalTvlAsBigInt = vaultGroupState.reduce((acc, vault) => {
      return acc + BigInt(vault.tvl.toString());
    }, BigInt(0));
    const totalTvlInUsdAsBigInt = (totalTvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
    const totalTvlInUsd = totalTvlInUsdAsBigInt / BigInt(1e8);
    const formattedTotalTvlInUsd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(totalTvlInUsd));

    return formattedTotalTvlInUsd;
  }, [ethPrice, vaultGroupState]);

  // Vault group data containing tvl values in usd and apy values
  const vaultGroupData = useMemo(() => {
    return vaultGroupState.map((vaultGroup) => {
      // TVL
      const tvlAsBigInt = BigInt(vaultGroup.tvl);
      const tvlInUsdAsBigInt = (tvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
      const tvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
      const formattedTvlInUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(tvlInUsd));

      // APY
      const formattedApy = `${vaultGroup.apy.toFixed(2)}%`;

      return {
        vaultGroupKey: vaultGroup.key,
        tvl: formattedTvlInUsd,
        apy: formattedApy,
      };
    });
  }, [vaultGroupState, ethPrice]);

  // Actions

  // Effects for async operations
  useEffect(() => {
    // Fetch and set vault group state
    async function fetchVaultGroupState() {
      try {
        setLoading(true);
        const vaultGroups = Object.keys(vaultGroupsConfig) as VaultGroup[];
        const tvlPromises = vaultGroups.map(async (vaultGroup) => {
          const tvl = await getTvlByVaultGroup(vaultGroup);
          const apy = await getApyByVaultGroup(vaultGroup);
          return {
            tvl: tvl.toString(),
            apy: apy,
            key: vaultGroup,
          };
        });
        const rawVaultGroupData = await Promise.all(tvlPromises);
        setVaultGroupState(rawVaultGroupData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchVaultGroupState();

    // Fetch and set ETH price state
    async function fetchEthPrice() {
      const price = await getEthPrice({ chain: mainnet });
      setEthPrice(price.toString());
    }
    fetchEthPrice();
  }, []);

  // Context value that passes along the derived state values and actions
  const value = useMemo(() => ({ totalTvl, vaultGroupData, loading }), [loading, totalTvl, vaultGroupData]);

  // Provider
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export { DashboardContext };
