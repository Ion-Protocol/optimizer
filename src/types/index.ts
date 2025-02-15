import { VaultKey } from "@molecular-labs/nucleus";

export interface VaultGroupConfigItem {
  name: string;
  vaults: VaultKey[];
  benefits: {
    multipliers: {
      token: string;
      value: number;
    }[];
    tokens: {
      token: string;
      value: number;
    }[];
  };
}

export enum VaultGroup {
  GroupOne = "groupone",
}

export type VaultGroupsConfig = Record<string, VaultGroupConfigItem>;
