import {
  BridgeData,
  getPreviewFee,
  getRateInQuoteSafe,
  getVaultByKey,
  prepareBridgeData,
  TellerAbi,
  TokenKey,
  VaultKey,
} from "@molecular-labs/nucleus";
import { mainnet } from "viem/chains";
import { simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { allowance, approve } from "../api/contracts/erc20";
import { wagmiConfig } from "../config/wagmi";

export class VaultService {
  // Private constructor to prevent instantiation.
  private constructor() {}

  private static mintSlippage = 0.005; // 0.5%

  private static calculateMinimumMint(depositAmount: bigint, rate: bigint): bigint {
    const slippageAsBigInt = BigInt((this.mintSlippage * 1e18).toString());
    const minimumMint = (depositAmount * BigInt(1e18)) / rate;
    const slippageAmount = (minimumMint * slippageAsBigInt) / BigInt(1e18);
    return minimumMint - slippageAmount;
  }

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
  public static async getPreviewFee({
    vaultKey,
    address,
    shareAmount,
  }: {
    vaultKey: VaultKey;
    address: `0x${string}`;
    shareAmount: bigint;
  }) {
    const config = getVaultByKey(vaultKey as VaultKey);
    const tellerContractAddress = config.contracts.teller;
    const bridgeChainId = config.deposit.bridgeChainIdentifier;
    if (bridgeChainId === 0) {
      return BigInt(0);
    }
    const bridgeData = prepareBridgeData(bridgeChainId, address, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    const previewFee = await getPreviewFee({
      shareAmount,
      bridgeData,
      contractAddress: tellerContractAddress,
      chain: mainnet,
    });
    return previewFee;
  }

  /** 
    Deposit into a vault
    Assuming all vaults are deposit only and no bridging is needed for now
  */
  public static async deposit({
    vaultKey,
    depositToken,
    depositAmount,
    address,
  }: {
    vaultKey: VaultKey;
    depositToken: TokenKey;
    depositAmount: bigint;
    address: `0x${string}`;
  }) {
    const config = getVaultByKey(vaultKey as VaultKey);
    const bridgeChainId = config.deposit.bridgeChainIdentifier;
    const depositTokenAddress =
      config.deposit.depositTokens[mainnet.id]?.[depositToken as TokenKey]?.token.addresses[mainnet.id];
    if (!depositTokenAddress) {
      throw new Error("Deposit token address not found");
    }
    const depositTokenAllowance = await allowance({
      tokenAddress: depositTokenAddress,
      spenderAddress: config.contracts.boringVault,
      userAddress: address,
    });

    if (depositTokenAllowance < depositAmount) {
      await approve({
        tokenAddress: depositTokenAddress,
        spenderAddress: config.contracts.boringVault,
        amount: depositAmount,
      });
    }

    ////////////////////////////////
    // Calculate Minimum Mint
    ////////////////////////////////
    const rate = await this.getRateInQuote(vaultKey, depositToken);
    const minimumMint = this.calculateMinimumMint(depositAmount, rate);

    ////////////////////////////////
    // Calculate Preview Fee
    ////////////////////////////////
    const previewFee = await this.getPreviewFee({
      vaultKey,
      address,
      shareAmount: minimumMint,
    });

    ////////////////////////////////
    // Prepare Bridge Data
    ////////////////////////////////
    const bridgeData: BridgeData = {
      chainSelector: config.deposit.bridgeChainIdentifier,
      destinationChainReceiver: address as `0x${string}`,
      bridgeFeeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH address
      messageGas: BigInt(100000),
      data: "0x",
    };

    ////////////////////////////////
    // Simulate
    ////////////////////////////////
    await simulateContract(wagmiConfig, {
      abi: TellerAbi,
      address: config.contracts.teller,
      functionName: bridgeChainId !== 0 ? "depositAndBridge" : "deposit",
      args:
        bridgeChainId !== 0 && bridgeData
          ? [depositTokenAddress, depositAmount, minimumMint, bridgeData]
          : [depositTokenAddress, depositAmount, minimumMint],
      value: bridgeChainId !== 0 ? previewFee : undefined,
    });

    ////////////////////////////////
    // Write
    ////////////////////////////////
    const txHash = await writeContract(wagmiConfig, {
      abi: TellerAbi,
      address: config.contracts.teller,
      functionName: bridgeChainId !== 0 ? "depositAndBridge" : "deposit",
      args:
        bridgeChainId !== 0 && bridgeData
          ? [depositTokenAddress, depositAmount, minimumMint, bridgeData]
          : [depositTokenAddress, depositAmount, minimumMint],
      value: bridgeChainId !== 0 ? previewFee : undefined,
    });

    ////////////////////////////////
    // Wait for Transaction Receipt
    ////////////////////////////////
    await waitForTransactionReceipt(wagmiConfig, {
      hash: txHash,
      timeout: 60_000,
      confirmations: 1,
      pollingInterval: 10_000,
      retryCount: 5,
      retryDelay: 5_000,
    });
  }

  public static async bridge({
    shareAmount,
    bridgeData,
    contractAddress,
    chainId,
    fee,
  }: {
    shareAmount: bigint;
    bridgeData: BridgeData;
    contractAddress: `0x${string}`;
    chainId: number;
    fee: bigint;
  }): Promise<string> {
    // const hash = await writeContract(wagmiConfig, {
    //   abi: CrossChainTellerBaseAbi,
    //   address: contractAddress,
    //   functionName: "bridge",
    //   args: [shareAmount, bridgeData],
    //   chainId: chainId,
    //   value: fee,
    // });
    return "";
  }
}
