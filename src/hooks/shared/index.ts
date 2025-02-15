import { VaultKey, getVaultByKey, getTotalSupply, getRate } from "@molecular-labs/nucleus";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { VaultGroup } from "../../types";
import { vaultGroupsConfig } from "../../config/vaultGroupsConfig";

/////////////////////////////////////
// Internal functions
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

/////////////////////////////////////
// Public functions
/////////////////////////////////////

// Get the TVL for a vault group by summing the TVLs of all the vaults in the group
export async function getTvlByVaultGroup(vaultGroup: VaultGroup) {
  const vaultGroupConfig = vaultGroupsConfig[vaultGroup];
  const vaultTvls = await Promise.all(vaultGroupConfig.vaults.map(getTvlByVault));
  const totalTvl = vaultTvls.reduce((acc, tvl) => acc + tvl, BigInt(0));
  return totalTvl;
}
