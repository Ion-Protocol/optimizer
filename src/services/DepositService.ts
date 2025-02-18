import {
  getPreviewFee,
  getRateInQuoteSafe,
  getVaultByKey,
  prepareBridgeData,
  TokenKey,
  VaultKey,
} from "@molecular-labs/nucleus";
import { mainnet } from "viem/chains";

export class DepositService {
  // Private constructor to prevent instantiation.
  private constructor() {}

  // Get the rate in quote for a vault
  public static async getRateInQuote(vaultKey: VaultKey, depositToken: TokenKey): Promise<bigint> {
    const config = getVaultByKey(vaultKey as VaultKey);
    const tokenAddress =
      config.deposit.depositTokens[mainnet.id]?.[depositToken as TokenKey]?.token.addresses[mainnet.id];
    const accountantAddress = config.contracts.accountant;
    if (!tokenAddress) {
      return BigInt(0);
    }
    const rate = await getRateInQuoteSafe({
      wantAssetAddress: tokenAddress,
      accountantAddress,
      chain: mainnet,
    });

    return rate;
  }

  // Get the preview fee for a vault
  public static async getPrevieFee(address: `0x${string}`, vaultKey: VaultKey) {
    const config = getVaultByKey(vaultKey as VaultKey);
    const tellerContractAddress = config.contracts.teller;
    const bridgeChainId = config.deposit.bridgeChainIdentifier;
    const bridgeData = prepareBridgeData(bridgeChainId, address, "0x0");
    const previewFee = await getPreviewFee({
      shareAmount: BigInt("0"),
      bridgeData,
      contractAddress: tellerContractAddress,
      chain: mainnet,
    });
    return previewFee;
  }

  /*
  ----------------
  Public functions
  ----------------
  depositOrMintAndBridge()
    - check allowance
    - if insufficient, approve
    - load config for this vault to determine if it's deposit or mint and bridge
    - if deposit
      - prepareDepositData()
      - makeDepositTransaction()
    - if mint and bridge
      - prepareMintAndBridgeData()
      - makeMintAndBridgeTransaction()

  ----------------
  Private functions
  ----------------
  prepareDepositData()
    - vaultKey
    - depositAsset
    - depositAmount

  prepareMintAndBridgeData()
    - vaultKey
    - depositAsset
    - depositAmount
    - userAddress

  makeDepositTransaction()
    - prepareDepositData()

  makeMintAndBridgeTransaction()
    - get preview fee
    - prepareMintAndBridgeData()
  */
}
