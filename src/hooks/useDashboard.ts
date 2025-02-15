import { getEthPrice, getVaultByKey } from "@molecular-labs/nucleus";
import { mainnet } from "viem/chains";
import { fetchVaultAPY } from "../api/nucleus";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { VaultGroup } from "../types";
import { useState, useMemo, useEffect } from "react";
import { getTvlByVaultGroup } from "./shared";
import { VaultGroupState } from "../types/dashboardTypes";

/////////////////////////////////////
// Async functions for dashboard
/////////////////////////////////////

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

export function useDashboard() {
  //////////////////
  // Raw state
  //////////////////
  const [vaultGroupState, setVaultGroupState] = useState<VaultGroupState[]>([]);
  const [ethPrice, setEthPrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

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
      const protocols = vaultGroupsConfig[vaultGroup.key].vaults;

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
        protocols: protocols,
      };
    });
  }, [vaultGroupState, ethPrice]);

  ///////////////////////////////
  // Effects for async operations
  ///////////////////////////////
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

  return {
    totalTvl,
    vaultGroupData,
    loading,
  };
}
