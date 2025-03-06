import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useVault } from "../hooks/useVault";
import { getVaultIcon } from "../lib/getIcons";
import { TokenSelect } from "./TokenSelect";
import { TransactionErrorModal } from "./TransactionErrorModal";
import TransactionStatusCard from "./ui/transaction-status-card";

export function DepositWithdraw() {
  const { vaultKey } = useParams<{ vaultKey: VaultKey }>();
  const { address } = useAccount();
  const {
    activeTab,
    availableTokens,
    changeInputValue,
    changeSelectedDepositToken,
    changeSelectedReceiveToken,
    changeSelectedTab,
    depositing,
    depositTokenIndex,
    formattedAssetBalance,
    formattedExchangeRate,
    formattedReceiveAmount,
    formattedVaultApy,
    formattedVaultBalance,
    formattedVaultBalanceInUsd,
    formattedVaultTvl,
    handleDeposit,
    handleWithdraw,
    inputValue,
    isDepositDisabled,
    isWithdrawDisabled,
    receiveTokenIndex,
    transactionStatus,
    withdrawing,
    vaultMetricsLoading,
    tokenMetricsLoading,
    error,
    resetTransactionStates,
  } = useVault();

  // Add state for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add state for error modal visibility
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Update useEffect to show error modal when error occurs
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  function handleClickDeposit() {
    setIsModalOpen(true);
    handleDeposit();
  }

  function handleClickWithdraw() {
    setIsModalOpen(true);
    handleWithdraw();
  }

  // Custom connect button that matches deposit/withdraw styling
  const CustomConnectButton = () => (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <Button className="w-full text-[16px] py-6" onClick={openConnectModal}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </ConnectButton.Custom>
  );

  return (
    <>
      <div className="bg-[#ffffff] border border-[#DFDFDF] rounded-[18px] overflow-hidden">
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white">
          {/* Left Column - Overview */}
          <div className="border-r border-[#DFDFDF] p-9">
            <h2 className="text-[20px] font-medium text-[#1f180f]">Overview</h2>

            <div className="mt-6">
              <h3 className="text-[#4d4d4d] text-[14px]">Your position</h3>
              <div className="flex items-center gap-3">
                <img src={getVaultIcon(vaultKey) || ""} alt={`${vaultKey} icon`} className="w-12 h-12" />
                <div>
                  {vaultMetricsLoading ? (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-[52px] w-[200px]" />
                      <Skeleton className="h-[18px] w-[140px]" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-[40px] font-medium text-[#CF5711]">{formattedVaultBalance}</span>
                        <span className="text-[14px] text-[#CF5711]">{vaultKey}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[#7b7b7b] text-[14px]">≈{formattedVaultBalanceInUsd}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[#4d4d4d] text-[14px]">asset optimizer analytics</h3>
              <div className="bg-[#fff8f3] p-4 rounded-lg mb-6 mt-2">
                <div className="flex flex-col">
                  <span className="text-[#cf5711] text-[14px] font-medium">APY</span>
                  {vaultMetricsLoading ? (
                    <Skeleton className="h-[36px] w-[120px]" />
                  ) : (
                    <span className="text-[24px] text-[#cf5711] font-medium">{formattedVaultApy}</span>
                  )}
                </div>
              </div>

              <div className="bg-[#f8f8f8] p-4 rounded-lg">
                <div className="flex items-center text-[#7b7b7b] text-[14px]">
                  <span>TVL</span>
                </div>
                {vaultMetricsLoading ? (
                  <Skeleton className="h-[22px] w-[160px]" />
                ) : (
                  <span className="text-[16px] font-medium">{formattedVaultTvl}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Deposit/Withdraw Form */}
          <div>
            <Tabs value={activeTab} onValueChange={changeSelectedTab as (value: string) => void} className="w-full">
              <TabsList className="inline-grid grid-cols-2 mb-8 px-9 pt-9">
                <TabsTrigger value="deposit" className="text-[14px] px-4">
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="text-[14px] px-4">
                  Withdraw
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <div className="pt-2">
                  <div className="space-y-6 px-9">
                    <div>
                      <label className="text-[#4d4d4d] text-[12px] mb-2 block">Your deposit</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="0.00"
                          className="pr-36 text-lg"
                          value={inputValue}
                          onChange={(e) => changeInputValue(e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <TokenSelect
                            tokens={availableTokens}
                            selectedIndex={depositTokenIndex}
                            onChange={changeSelectedDepositToken}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-[#7b7b7b]">
                        {tokenMetricsLoading ? (
                          <Skeleton className="h-[20px] w-[120px]" />
                        ) : (
                          <span>{formattedAssetBalance} available</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[#4d4d4d] text-[12px] block">And receive</label>
                      <div className="flex items-center gap-2">
                        <img src={getVaultIcon(vaultKey) || ""} alt={`${vaultKey} icon`} className="w-6 h-6" />
                        {tokenMetricsLoading ? (
                          <Skeleton className="h-[24px] w-[120px]" />
                        ) : (
                          <span className="text-[16px]">{formattedReceiveAmount}</span>
                        )}
                      </div>
                      <div className="text-[12px] text-[#7b7b7b] pb-8">
                        {tokenMetricsLoading ? (
                          <Skeleton className="h-[16px] w-[180px]" />
                        ) : (
                          `Exchange Rate: ${formattedExchangeRate}`
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DFDFDF]">
                  <div className="px-9 pt-9">
                    {address ? (
                      <Button
                        className="w-full text-[16px] py-6"
                        onClick={handleClickDeposit}
                        disabled={isDepositDisabled}
                      >
                        {depositing ? "Depositing..." : "Deposit"}
                      </Button>
                    ) : (
                      <CustomConnectButton />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="withdraw">
                <div className="pt-2">
                  <div className="space-y-6 px-9">
                    <div>
                      <label className="text-[#4d4d4d] text-[12px] mb-2 block">You withdraw</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="0.00"
                          className="pr-32 text-lg"
                          value={inputValue}
                          onChange={(e) => changeInputValue(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-[#7b7b7b]">
                        <span>{formattedAssetBalance} available</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[#4d4d4d] text-[12px] block">And receive</label>
                      <div className="flex items-center gap-2">
                        {tokenMetricsLoading ? (
                          <Skeleton className="h-[24px] w-[120px]" />
                        ) : (
                          <span className="text-[16px]">{formattedReceiveAmount}</span>
                        )}
                        <TokenSelect
                          tokens={availableTokens}
                          selectedIndex={receiveTokenIndex}
                          onChange={changeSelectedReceiveToken}
                        />
                      </div>
                      <div className="text-[12px] text-[#7b7b7b] pb-8">{/* Added spacing to match deposit tab */}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DFDFDF]">
                  <div className="px-9 pt-9">
                    {address ? (
                      <Button
                        className="w-full text-[16px] py-6"
                        onClick={handleClickWithdraw}
                        disabled={isWithdrawDisabled}
                      >
                        {withdrawing ? "Withdrawing..." : "Withdraw"}
                      </Button>
                    ) : (
                      <CustomConnectButton />
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Replace the existing modal implementation with this */}
      {isModalOpen && !error && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <TransactionStatusCard
              steps={
                activeTab === "deposit"
                  ? [
                      ...(transactionStatus.deposit.approval.status !== "idle"
                        ? [
                            {
                              id: "approve",
                              label: "Approve",
                              status: transactionStatus.deposit.approval.status,
                            },
                          ]
                        : []),
                      {
                        id: "deposit",
                        label: "Deposit",
                        status: transactionStatus.deposit.deposit.status,
                      },
                    ]
                  : [
                      ...(transactionStatus.withdraw.bridge.status !== "idle"
                        ? [
                            {
                              id: "bridge",
                              label: "Bridge",
                              status: transactionStatus.withdraw.bridge.status,
                            },
                          ]
                        : []),
                      ...(transactionStatus.withdraw.approval.status !== "idle"
                        ? [
                            {
                              id: "approve",
                              label: "Approve",
                              status: transactionStatus.withdraw.approval.status,
                            },
                          ]
                        : []),
                      {
                        id: "update_request",
                        label: "Update Request",
                        status: transactionStatus.withdraw.updateAtomicRequest.status,
                      },
                    ]
              }
              sendAmount={inputValue}
              receiveAmount={formattedReceiveAmount}
              sendToken={activeTab === "deposit" ? availableTokens[depositTokenIndex].token.symbol : vaultKey || ""}
              receiveToken={activeTab === "deposit" ? vaultKey || "" : availableTokens[receiveTokenIndex].token.symbol}
              onClose={() => setIsModalOpen(false)}
              onRefresh={() => console.log("Card refreshed")}
            />
          </div>
        </div>
      )}

      {/* Add error modal */}
      {showErrorModal && error && (
        <TransactionErrorModal
          error={error}
          activeTab={activeTab}
          onClose={() => {
            setShowErrorModal(false);
            setIsModalOpen(false);
            resetTransactionStates();
          }}
        />
      )}
    </>
  );
}
