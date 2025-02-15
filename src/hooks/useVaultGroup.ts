import { getEthPrice, VaultKey } from "@molecular-labs/nucleus";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mainnet } from "viem/chains";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { ApyService } from "../services/ApyService";
import { TvlService } from "../services/TvlService";
import { VaultGroup } from "../types";

export function useVaultGroup() {
  //////////////////
  // Hooks
  //////////////////
  const { vaultGroup } = useParams();

  //////////////////
  // Raw state
  //////////////////
  const [vaultsState, setVaultsState] = useState<{ key: VaultKey; tvl: string; apy: number }[]>([]);
  const [ethPrice, setEthPrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //////////////////
  // Derived state
  //////////////////
  // Total TVL
  const totalTvl = useMemo(() => {
    const totalTvlAsBigInt = vaultsState.reduce((acc, vault) => acc + BigInt(vault.tvl), BigInt(0));
    const totalTvlInUsdAsBigInt = (totalTvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
    const totalTvlInUsd = totalTvlInUsdAsBigInt / BigInt(1e8);
    const formattedTotalTvlInUsd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(totalTvlInUsd));

    return formattedTotalTvlInUsd;
  }, [ethPrice, vaultsState]);

  // Vaults data including TVL, APY, benefits, and rewards count
  const vaultsData = useMemo(() => {
    return vaultsState.map((vaultState) => {
      // TVL
      const tvlAsBigInt = BigInt(vaultState.tvl);
      const tvlInUsdAsBigInt = (tvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
      const tvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
      const formattedTvlInUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(tvlInUsd));

      // APY
      const formattedApy = `${vaultState.apy.toFixed(2)}%`;

      // Benefits
      const benefits = vaultGroupsConfig[vaultGroup as VaultGroup].benefits;

      // Rewards count
      const rewardsCount = benefits.tokens.length;

      return {
        key: vaultState.key,
        tvl: formattedTvlInUsd,
        apy: formattedApy,
        benefits,
        rewardsCount,
      };
    });
  }, [ethPrice, vaultGroup, vaultsState]);

  ///////////////////////////////
  // Effects for async operations
  ///////////////////////////////

  useEffect(() => {
    // Fetch and set vaults state
    async function fetchVaultsState() {
      try {
        setLoading(true);
        const vaults = vaultGroupsConfig[vaultGroup as VaultGroup].vaults;
        const promises = vaults.map(async (vaultKey) => {
          const apy = await ApyService.getApyByVault(vaultKey);
          const tvl = await TvlService.getTvlByVault(vaultKey);
          return {
            key: vaultKey,
            tvl: tvl.toString(),
            apy: apy,
          };
        });
        const rawVaultsState = await Promise.all(promises);
        setVaultsState(rawVaultsState);
      } catch (error) {
        console.error(error);
        setError(error as string);
      } finally {
        setLoading(false);
      }
    }
    fetchVaultsState();

    // Fetch and set ETH price state
    async function fetchEthPrice() {
      try {
        const price = await getEthPrice({ chain: mainnet });
        setEthPrice(price.toString());
      } catch (error) {
        console.error(error);
        setError(error as string);
      }
    }
    fetchEthPrice();
  }, [vaultGroup]);

  return {
    vaultsData,
    totalTvl,
    loading,
    error,
  };
}
