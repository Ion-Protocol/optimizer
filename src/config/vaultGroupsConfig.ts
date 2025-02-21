import { VaultGroupsConfig, VaultGroup } from "../types";

export const vaultGroupsConfig: VaultGroupsConfig = {
  [VaultGroup.GroupOne]: {
    name: "Group 1",
    vaults: ["bobaeth", "sseth", "feth"],

    // Sample data
    benefits: {
      multipliers: [
        {
          token: "eth",
          value: 3,
        },
        {
          token: "btc",
          value: 1.5,
        },
      ],
      tokens: [
        {
          token: "mkr",
          value: 128.2,
        },
        {
          token: "tel",
          value: 67.9,
        },
        {
          token: "uni",
          value: 48.6,
        },
        {
          token: "ren",
          value: 48.6,
        },
      ],
    },
  },
  [VaultGroup.GroupTwo]: {
    name: "Group 2",
    vaults: ["bobaeth", "sseth", "feth"],
    benefits: {
      multipliers: [
        {
          token: "eth",
          value: 2.5,
        },
        {
          token: "sol",
          value: 2.0,
        },
      ],
      tokens: [
        {
          token: "link",
          value: 95.4,
        },
        {
          token: "aave",
          value: 72.1,
        },
      ],
    },
  },
  [VaultGroup.GroupThree]: {
    name: "Group 3",
    vaults: ["bobaeth", "sseth", "feth"],
    benefits: {
      multipliers: [
        {
          token: "eth",
          value: 1.8,
        },
        {
          token: "matic",
          value: 2.2,
        },
      ],
      tokens: [
        {
          token: "snx",
          value: 84.3,
        },
        {
          token: "crv",
          value: 56.7,
        },
        {
          token: "bal",
          value: 42.5,
        },
      ],
    },
  },
};
