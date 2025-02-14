import { VaultKey } from "@molecular-labs/nucleus";

// Raw state types in the DashboardContext
export interface VaultState {
  vaultKey: VaultKey;
  tvl: string; // TVL in ETH as bigint string
}

// Often includes values derived from raw state
export type DashboardContextType = {
  totalTvl: string;
  vaultData: {
    vaultKey: VaultKey;
    tvl: string;
  }[];
  loading: boolean;
};
