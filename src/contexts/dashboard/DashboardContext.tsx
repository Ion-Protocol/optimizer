import {
  getAllVaultKeys,
  getEthPrice,
  getRate,
  getTotalSupply,
  getVaultByKey,
  VaultKey,
} from "@molecular-labs/nucleus";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { DashboardContextType, VaultState } from "./dashboardTypes";

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
  // console.log(vaultKey, vaultTotalSupply, vaultShareRate);
  const tvl = (vaultTotalSupply * vaultShareRate) / BigInt(1e18);
  return tvl;
}

/////////////////////////////////////
// Dashboard Context
/////////////////////////////////////

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // Raw state
  const [vaultState, setVaultState] = useState<VaultState[]>([]);
  const [ethPrice, setEthPrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

  // Derived state
  const totalTvl = useMemo(() => {
    const totalTvlAsBigInt = vaultState.reduce((acc, vault) => {
      return acc + BigInt(vault.tvl.toString());
    }, BigInt(0));
    const totalTvlInUsdAsBigInt = (totalTvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
    const totalTvlInUsd = totalTvlInUsdAsBigInt / BigInt(1e8);
    const formattedTotalTvlInUsd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(totalTvlInUsd));

    return formattedTotalTvlInUsd;
  }, [ethPrice, vaultState]);

  const vaultData = useMemo(() => {
    return vaultState.map((vault) => {
      const tvlAsBigInt = BigInt(vault.tvl);
      const tvlInUsdAsBigInt = (tvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
      const tvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
      const formattedTvlInUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(tvlInUsd));
      return {
        vaultKey: vault.vaultKey,
        tvl: formattedTvlInUsd,
      };
    });
  }, [vaultState, ethPrice]);

  // Actions

  // Effects for async operations
  useEffect(() => {
    // Fetch and set vault state
    async function fetchVaultState() {
      try {
        setLoading(true);
        const vaultKeys = getAllVaultKeys();
        const tvlPromises = vaultKeys.map(async (vaultKey) => {
          const tvl = await getTvlByVault(vaultKey);
          return {
            tvl: tvl.toString(),
            vaultKey,
          };
        });
        const vaultData = await Promise.all(tvlPromises);
        setVaultState(vaultData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchVaultState();

    // Fetch and set ETH price state
    async function fetchEthPrice() {
      const price = await getEthPrice({ chain: mainnet });
      setEthPrice(price.toString());
    }
    fetchEthPrice();
  }, []);

  // Context value
  const value = useMemo(() => ({ totalTvl, vaultData, loading }), [totalTvl, vaultData, loading]);

  // Provider
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export { DashboardContext };
