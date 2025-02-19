import { Address, erc20Abi } from "viem";
import { useChainManagement } from "./useChainManagement";
import { useCallback, useMemo, useState } from "react";
import { getVaultByKey, VaultKey } from "@molecular-labs/nucleus";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { VaultService } from "../services/VaultService";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { wagmiConfig } from "../config/wagmi";

const MAINNET_CHAINSTACK_URL = import.meta.env.VITE_PUBLIC_MAINNET_CHAINSTACK_URL;

export enum RedeemStepType {
  BRIDGE = "BRIDGE",
  APPROVE = "APPROVE",
  REQUEST = "REQUEST",
  CONFIRM = "CONFIRM",
}

export type StepState = "idle" | "active" | "completed" | "error";

export type DialogStep = {
  id: number;
  type: RedeemStepType;
  description: string;
  state: StepState;
  errorMessage?: string;
  link?: string;
};

const createSteps = (isBridgeRequired: boolean): DialogStep[] => {
  if (isBridgeRequired) {
    return [
      { id: 1, type: RedeemStepType.BRIDGE, description: "Request Bridge", state: "idle" },
      { id: 2, type: RedeemStepType.APPROVE, description: "Approve", state: "idle" },
      { id: 3, type: RedeemStepType.REQUEST, description: "Request Withdraw", state: "idle" },
    ];
  }
  return [
    { id: 1, type: RedeemStepType.APPROVE, description: "Approve", state: "idle" },
    { id: 2, type: RedeemStepType.REQUEST, description: "Request Withdraw", state: "idle" },
  ];
};

export type AtomicRequestArgs = {
  offer: Address; // sharesTokenAddress
  want: Address; // wantTokenAddress
  userRequest: UserRequest; // userRequest
};

export type AtomicRequestOptions = {
  atomicQueueContractAddress: Address; // atomicQueueContractAddress
  chainId: number; // destinationChainId
};

export type UserRequest = {
  deadline: bigint; // deadline
  atomicPrice: bigint; // rateInQuoteWithFee
  offerAmount: bigint; // redeemAmount
  inSolve: boolean; // false
};

type BaseRedeemData = {
  isBridgeRequired: boolean;
  userAddress: Address;
  redeemAmount: bigint;
  allowance?: bigint;
  sharesTokenAddress: Address;
  wantTokenAddress: Address;
  redemptionSourceChainId: number;
  destinationChainId: number;
  sourceExplorerBaseUrl?: string;
  destinationExplorerBaseUrl?: string;
  atomicRequestData: {
    atomicRequestArgs: AtomicRequestArgs;
    atomicRequestOptions: AtomicRequestOptions;
  };
};

type StandardRedeemData = BaseRedeemData & {
  isBridgeRequired: false;
  redeemBridgeData?: never;
};

type RedeemWithBridgeData = BaseRedeemData & {
  isBridgeRequired: true;
  redeemWithBridgeData: {
    tellerContractAddress: Address;
    previewFeeAsBigInt: bigint;
    layerZeroChainSelector: number;
    bridgeData: BridgeData;
  };
};

export type BridgeData = {
  chainSelector: number;
  destinationChainReceiver: Address;
  bridgeFeeToken: Address;
  messageGas: bigint;
  data: `0x${string}`;
};

type HandleRedeem = StandardRedeemData | RedeemWithBridgeData;

export const useRedeem = () => {
  const { switchToChain } = useChainManagement();
  const { vaultKey } = useParams();
  const { chainId } = useAccount();

  const [title, setTitle] = useState("Redeem Status");
  const [steps, setSteps] = useState<DialogStep[]>([]);
  const [headerContent, setHeaderContent] = useState("redeemSummary");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dialogStep, setDialogStep] = useState<DialogStep | null>(null);

  const config = useMemo(() => getVaultByKey(vaultKey as VaultKey), [vaultKey]);
  const isBridgeRequired = config.withdraw.bridgeChainIdentifier !== 0;

  const getStepId = useCallback(
    (stepType: RedeemStepType): number => {
      const steps = createSteps(isBridgeRequired);
      const step = steps.find((s) => s.type === stepType);
      return step?.id || 0;
    },
    [isBridgeRequired]
  );

  /**
   ******************************************************************************
   * Handle redeem
   ******************************************************************************
   */

  const handleRedeem = async (data: HandleRedeem) => {
    const {
      isBridgeRequired,
      redemptionSourceChainId,
      destinationChainId,
      redeemAmount,
      allowance,
      atomicRequestData,
      sharesTokenAddress,
      sourceExplorerBaseUrl,
      destinationExplorerBaseUrl,
    } = data;

    setTitle("Redeem Status");
    setSteps(createSteps(isBridgeRequired));
    setHeaderContent("redeemSummary");
    setOpen(true);
    // Before starting a new step, restore completed steps
    // dispatch(restoreCompletedSteps());

    // Check if a bridge is required
    if (isBridgeRequired) {
      const redeemWithBridgeData = data.redeemWithBridgeData;
      // dispatch(restoreCompletedSteps());
      const bridgeStepId = getStepId(RedeemStepType.BRIDGE);
      if (!redeemWithBridgeData) {
        console.error("Bridge data missing:", { redeemWithBridgeData });
        setHeaderContent("Error");

        setStatus({
          type: "error",
          message: "Missing bridge data",
        });
        setOpen(true);
        return;
      }
      //////////////////////////////////////////////////////////////////////////
      // 1. Switch chains to redemption source chain if needed
      //     If the chain the wallet is connected to does not match the source
      //     chain that the user selected, switch it to the source chain.
      //////////////////////////////////////////////////////////////////////////
      if (isBridgeRequired) {
        await switchToChain(redemptionSourceChainId!);
      }

      // Call Bridge function
      try {
        setDialogStep({
          id: bridgeStepId,
          type: RedeemStepType.BRIDGE,
          description: "Request Bridge",
          state: "active",
        });
        const { previewFeeAsBigInt, bridgeData, tellerContractAddress } = redeemWithBridgeData;
        if (!previewFeeAsBigInt) {
          throw new Error("Bridge fee is undefined");
        }

        const txHash = await VaultService.bridge({
          shareAmount: redeemAmount,
          bridgeData: bridgeData,
          contractAddress: tellerContractAddress,
          chainId: redemptionSourceChainId,
          fee: previewFeeAsBigInt,
        });

        const bridgeReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash as `0x${string}`,
          timeout: 60_000,
          confirmations: 1,
          pollingInterval: 10_000,
          retryCount: 5,
          retryDelay: 5_000,
        });

        // TODO: Double check this to make sure the params are correct
        setDialogStep({
          id: bridgeStepId,
          type: RedeemStepType.BRIDGE,
          description: "Request Bridge",
          state: "completed",
          link: `${sourceExplorerBaseUrl}/tx/${bridgeReceipt.transactionHash}`,
        });
      } catch (error) {
        console.error("Bridge transaction failed:", error);

        // TODO: Double check this to make sure the params are correct
        setDialogStep({
          id: bridgeStepId,
          type: RedeemStepType.BRIDGE,
          description: "Request Bridge",
          state: "error",
        });
        setStatus({
          type: "error",
          message: "Bridge transaction failed",
        });
        return;
      }
    }

    //////////////////////////////////////////////////////////////////////////
    // 2. Approve shares token for withdrawal if needed
    //////////////////////////////////////////////////////////////////////////
    await switchToChain(destinationChainId);
    // Then wait a short moment for the chain switch to take effect
    await new Promise((resolve) => setTimeout(resolve, 500));

    let approveTokenTxHash: `0x${string}` | undefined;
    //////////////////////////////////////////////////////////////////////////
    // 3.1 Approve shares token for withdrawal if needed
    //////////////////////////////////////////////////////////////////////////
    const approveStepId = getStepId(RedeemStepType.APPROVE);
    // TODO: Double check this to make sure the params are correct
    setDialogStep({
      id: approveStepId,
      type: RedeemStepType.APPROVE,
      description: "Approve",
      state: "active",
    });
    if (!allowance || allowance < redeemAmount) {
      try {
        // Handle approval
        const approveTokenTxHash = await writeContract(wagmiConfig, {
          abi: erc20Abi,
          address: tokenAddress,
          functionName: "approve",
          args: [spenderAddress, amount],
          chainId,
        });

        const approvalReceipt = await queryErc20TxReceipt({ hash: approveTokenTxHash });

        if (approvalReceipt.isError) {
          throw new Error(`Approval Error: ${approvalReceipt.error}`);
        }

        if (approveTokenTxHash) {
          dispatch(
            setDialogStep({
              stepId: approveStepId,
              newState: "completed",
              link: `${destinationExplorerBaseUrl}/tx/${approvalReceipt.data?.transactionHash}`,
            })
          );
        }
      } catch (error) {
        console.error("Approval failed:", error);
        dispatch(setDialogStep({ stepId: approveStepId, newState: "error" }));
        dispatch(
          setStatus({
            type: "error",
            message: "Approval failed",
            fullMessage: error instanceof Error ? error.message : "Unknown error occurred",
          })
        );
        return;
      }
    } else {
      const approveStepId = getStepId(RedeemStepType.APPROVE);
      dispatch(setDialogStep({ stepId: approveStepId, newState: "completed" }));
    }

    //////////////////////////////////////////////////////////////////////////
    // 3.2 Update atomic request
    //////////////////////////////////////////////////////////////////////////
    dispatch(restoreCompletedSteps());
    if ((!allowance || allowance < redeemAmount) && !approveTokenTxHash) {
      console.error("Insufficient allowance:", { allowance, redeemAmount, approveTokenTxHash });
      dispatch(setHeaderContent("Error"));
      dispatch(
        setStatus({
          type: "error",
          message: "Insufficient allowance",
        })
      );
      return;
    }
    const requestStepId = getStepId(RedeemStepType.REQUEST);
    try {
      const { atomicRequestArgs, atomicRequestOptions } = atomicRequestData;
      dispatch(restoreCompletedSteps());
      dispatch(setDialogStep({ stepId: requestStepId, newState: "active" }));
      // Then wait a short moment before calling updateAtomicRequest
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updateAtomicRequestTxHash = await updateAtomicRequest({
        atomicRequestArg: atomicRequestArgs,
        atomicRequestOptions: atomicRequestOptions,
      }).unwrap();
      // Mock updateAtomicRequest with delay
      // const updateAtomicRequestTxHash = await new Promise<string>((resolve) => {
      //   setTimeout(() => {
      //     resolve('0x123...')
      //   }, 2000) // 2 second delay
      // })
      const atomicRequestReceipt = await queryAtomicRequestReceipt({ hash: updateAtomicRequestTxHash });

      if (atomicRequestReceipt.isError) {
        throw new Error(`Atomic Request Error: ${atomicRequestReceipt.error}`);
      }

      if (updateAtomicRequestTxHash) {
        dispatch(
          setDialogStep({
            stepId: requestStepId,
            newState: "completed",
            link: `${destinationExplorerBaseUrl}/tx/${atomicRequestReceipt.data?.transactionHash}`,
          })
        );
        dispatch(
          setStatus({
            type: "success",
          })
        );
        dispatch(setHeaderContent("redeemSummary"));
      }
    } catch (error) {
      console.error("Transaction failed in", process.env.NODE_ENV, "environment:", {
        error,
        networkId,
        timestamp: new Date().toISOString(),
      });
      console.error("Atomic request failed:", error);

      dispatch(setDialogStep({ stepId: requestStepId, newState: "error" }));
      dispatch(
        setStatus({
          type: "error",
          message: "Request failed",
          fullMessage: error instanceof Error ? error.message : "Unknown error occurred",
        })
      );
      return;
    }
  };

  return {
    handleRedeem,
    isLoading:
      isApproveErc20Loading ||
      isApproveErc20TxReceiptLoading ||
      isUpdateAtomicRequestLoading ||
      isAtomicRequestReceiptLoading ||
      isBridgeLoading ||
      isBridgeReceiptLoading,
  };
};
