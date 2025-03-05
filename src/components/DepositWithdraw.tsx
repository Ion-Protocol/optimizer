import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useVault } from "../hooks/useVault";
import { TokenSelect } from "./TokenSelect";
import { getVaultIcon } from "../lib/getIcons";
import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { useState } from "react";
import TransactionStatusCard from "./ui/transaction-status-card";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
    loading,
    receiveTokenIndex,
    transactionStatus,
    withdrawing,
  } = useVault();

  // Add state for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="bg-[#ffffff] p-9 border border-[#DFDFDF] rounded-[18px]">
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm">
          {/* Left Column - Overview */}
          <div>
            <h2 className="text-[20px] font-medium text-[#1f180f]">Overview</h2>

            <div className="mt-6">
              <h3 className="text-[#4d4d4d] text-[14px]">Your position</h3>
              <div className="flex items-center gap-3">
                <img src={getVaultIcon(vaultKey) || ""} alt={`${vaultKey} icon`} className="w-12 h-12" />
                <div>
                  <div className="flex items-baseline mt-5">
                    <span className="text-[40px] font-medium text-[#CF5711]">{formattedVaultBalance}</span>
                    <span className="text-[14px] text-[#CF5711]">{vaultKey}</span>
                  </div>
                  <div className="-mt-1">
                    <span className="text-[#7b7b7b] text-[14px]">≈{formattedVaultBalanceInUsd}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[#4d4d4d] text-[14px]">asset optimizer analytics</h3>
              <div className="bg-[#fff8f3] p-4 rounded-lg mb-6 mt-2">
                <div className="flex flex-col">
                  <span className="text-[#cf5711] text-[14px] font-medium">APY</span>
                  <span className="text-[24px] text-[#cf5711] font-medium">{formattedVaultApy}</span>
                </div>
              </div>

              <div className="bg-[#f8f8f8] p-4 rounded-lg">
                <div className="flex items-center text-[#7b7b7b] text-[14px]">
                  <span>TVL</span>
                </div>
                <span className="text-[16px] font-medium">{formattedVaultTvl}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Deposit/Withdraw Form */}
          <div>
            <Tabs value={activeTab} onValueChange={changeSelectedTab as (value: string) => void} className="w-full">
              <TabsList className="inline-grid grid-cols-2 mb-8">
                <TabsTrigger value="deposit" className="text-[14px] px-4">
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="text-[14px] px-4">
                  Withdraw
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-6">
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
                    <span>{formattedAssetBalance} available</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[#4d4d4d] text-[12px] block">And receive</label>
                  <div className="flex items-center gap-2">
                    <img src={getVaultIcon(vaultKey) || ""} alt={`${vaultKey} icon`} className="w-6 h-6" />
                    <span className="text-[16px]">{formattedReceiveAmount}</span>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">Exchange Rate: {formattedExchangeRate}</div>
                </div>

                {address ? (
                  <Button
                    className="w-full text-[16px] py-6"
                    onClick={handleClickDeposit}
                    disabled={isDepositDisabled || loading}
                  >
                    {depositing ? "Depositing..." : "Deposit"}
                  </Button>
                ) : (
                  <CustomConnectButton />
                )}
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-6">
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

                <div>
                  <label className="text-[#4d4d4d] text-[12px] mb-2 block">And receive</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">{formattedReceiveAmount}</span>
                    <TokenSelect
                      tokens={availableTokens}
                      selectedIndex={receiveTokenIndex}
                      onChange={changeSelectedReceiveToken}
                    />
                  </div>
                </div>

                {address ? (
                  <Button
                    className="w-full text-[16px] py-6"
                    onClick={handleClickWithdraw}
                    disabled={isWithdrawDisabled || loading}
                  >
                    {withdrawing ? "Withdrawing..." : "Withdraw"}
                  </Button>
                ) : (
                  <CustomConnectButton />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal Implementation */}
      {isModalOpen && (
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
    </>
  );
}
