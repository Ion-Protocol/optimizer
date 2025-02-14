import { VaultKey } from "@molecular-labs/nucleus";

export interface VaultGroupConfigItem {
  name: string;
  vaults: VaultKey[];
}

export enum VaultGroup {
  GroupOne = "groupone",
}

export type VaultGroupsConfig = Record<string, VaultGroupConfigItem>;
