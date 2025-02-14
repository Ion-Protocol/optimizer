import { VaultKey } from "@molecular-labs/nucleus";
import { VaultGroup } from "../../types";

// Raw state types in the DashboardContext
export interface VaultState {
  vaultKey: VaultKey;
  tvl: string; // TVL in ETH as bigint string
  apy: number; // APY as a percentage (e.g. 100 for 100%)
}

export interface VaultGroupState {
  key: VaultGroup;
  tvl: string; // TVL in USD as bigint string
  apy: number; // APY as a percentage (e.g. 100 for 100%)
}

// Often includes values derived from raw state
export interface VaultGroupData {
  vaultGroupKey: VaultGroup;
  tvl: string;
  apy: string; // Formatted as a percentage (e.g. 100 for "100%")
  protocols: VaultKey[];
}

export interface DashboardContextType {
  totalTvl: string;
  vaultGroupData: VaultGroupData[];
  loading: boolean;
}
