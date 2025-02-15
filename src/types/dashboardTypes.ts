import { VaultKey } from "@molecular-labs/nucleus";
import { VaultGroup } from ".";

export interface VaultGroupState {
  key: VaultGroup;
  tvl: string; // TVL in ETH as bigint string
  apy: number; // APY as a percentage (e.g. 100 for 100%)
}

export interface VaultGroupItem {
  vaultGroupKey: VaultGroup;
  tvl: string;
  apy: string;
  protocols: VaultKey[];
}

// Often includes values derived from raw state
export interface DashboardContextType {
  totalTvl: string;
  vaultGroupData: VaultGroupItem[];
  loading: boolean;
}
