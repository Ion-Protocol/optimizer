import { getTokenIcon, getVaultIcon } from "@/lib/getIcons";
import { VaultKey } from "@molecular-labs/nucleus";
import { X, RefreshCw, ArrowRight, Clock, CheckCircle } from "lucide-react";

type StepStatus = "idle" | "processing" | "done" | "error";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

export interface TransactionStatusCardProps {
  /**
   * The steps to display in the card
   */
  steps: Step[];

  /**
   * The amount being sent
   */
  sendAmount?: string;

  /**
   * The amount being received
   */
  receiveAmount?: string;

  /**
   * The token being sent
   */
  sendToken: string;

  /**
   * The token being received
   */
  receiveToken: string;

  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;

  /**
   * Callback when the refresh button is clicked
   */
  onRefresh?: () => void;
}

export default function TransactionStatusCard({
  steps,
  sendAmount,
  receiveAmount,
  sendToken,
  receiveToken,
  onClose,
}: TransactionStatusCardProps) {
  // Check if all steps are done
  const allStepsDone = steps.every((step) => step.status === "done");

  // Helper function to render status indicator
  const renderStatusIndicator = (status: StepStatus) => {
    switch (status) {
      case "idle":
        return (
          <div className="flex items-center text-[#7b7b7b]">
            <Clock size={14} className="mr-1" />
            <span className="text-xs">Not Started</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center text-[#7b7b7b]">
            <div className="w-3 h-3 border-2 border-[#7b7b7b] border-t-transparent rounded-full animate-spin mr-1"></div>
            <span className="text-xs">Processing</span>
          </div>
        );
      case "done":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle size={14} className="mr-1" />
            <span className="text-xs">Done</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-red-500">
            <X size={14} className="mr-1" />
            <span className="text-xs">Error</span>
          </div>
        );
    }
  };

  const TokenIcon = ({ symbol }: { symbol: string }) => {
    if (!symbol) return <div className="w-[52px] h-[52px] rounded-full bg-gray-200" />;

    const tokenIconSrc = getTokenIcon(symbol.toLowerCase());
    const iconSrc = tokenIconSrc || getVaultIcon(symbol.toLowerCase() as VaultKey);
    return iconSrc ? (
      <img src={iconSrc} alt={`${symbol} icon`} className="w-[52px] h-[52px] rounded-full" />
    ) : (
      <div className="w-[52px] h-[52px] rounded-full bg-gray-200" />
    );
  };

  return (
    <div className="w-[450px] border border-[#dfdfdf] rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#dfdfdf] relative">
        <button
          className="absolute right-4 top-4 text-[#7b7b7b] hover:text-[#4d4d4d] transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <div className="text-center">
          <h3 className="text-[#1f180f] text-[24px] font-medium">{allStepsDone ? "Success" : "Order Status"}</h3>
          <p className="text-[#7b7b7b] text-[16px] mt-1">
            {allStepsDone ? "Your transaction was made with success" : "Transaction processing..."}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-[#f8f8f8] py-10 px-[100px] flex items-center justify-between">
        <div className="flex items-center flex-col gap-2">
          <TokenIcon symbol={sendToken} />
          <span className="text-sm font-medium text-[#1f180f] whitespace-nowrap">
            -{sendAmount} {sendToken}
          </span>
        </div>

        <RefreshCw size={16} className={allStepsDone ? "" : "animate-spin"} />

        <div className="flex items-center flex-col gap-2">
          <TokenIcon symbol={receiveToken} />
          <span className="text-sm font-medium text-[#1f180f] whitespace-nowrap">
            +{receiveAmount} {receiveToken}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 px-6 flex items-center justify-between ${
              index !== steps.length - 1 ? "border-b border-[#dfdfdf]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                  step.status === "done" ? "text-green-500" : "text-[#7b7b7b]"
                }`}
              >
                {step.status === "done" ? (
                  <CheckCircle size={20} />
                ) : (
                  <span className="w-4 h-4 border-2 border-[#7b7b7b] rounded-full"></span>
                )}
              </div>
              <span className="text-sm text-[#1f180f]">{step.label}</span>
              {step.status !== "idle" && <ArrowRight size={14} className="ml-1 text-[#7b7b7b]" />}
            </div>

            <div className="flex items-center">{renderStatusIndicator(step.status)}</div>
          </div>
        ))}
      </div>

      {/* Done Button */}
      {allStepsDone && (
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full h-[48px] bg-[#FF6C15] text-white rounded-lg font-medium hover:bg-[#FF6C15]/90 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
