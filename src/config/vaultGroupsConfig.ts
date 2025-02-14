import { VaultGroupsConfig, VaultGroup } from "../types";

export const vaultGroupsConfig: VaultGroupsConfig = {
  [VaultGroup.GroupOne]: {
    name: "Group 1",
    vaults: ["bobaeth", "sseth", "feth"],
  },
};
