import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useVault } from "../hooks/useVault";
import { TokenSelect } from "./TokenSelect";

export function DepositWithdraw() {
  const { vaultKey } = useParams();
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
    withdrawing,
  } = useVault();

  return (
    <div className="bg-[#f8f8f8] p-6 border border-[#DFDFDF] rounded-lg">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm">
        {/* Left Column - Overview */}
        <div className="space-y-8">
          <h2 className="text-2xl font-medium text-[#1f180f]">Overview</h2>

          <div className="space-y-2">
            <h3 className="text-[#4d4d4d]">Your position</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#dfdfdf] rounded-full" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-medium text-[#f7931a]">{formattedVaultBalance}</span>
                  <span className="text-xl text-[#7b7b7b]">{vaultKey}</span>
                </div>
                <span className="text-[#7b7b7b]">≈{formattedVaultBalanceInUsd}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#4d4d4d] mb-4">asset optimizer analytics</h3>
            <div className="bg-[#fff8f3] p-4 rounded-lg mb-6">
              <div className="flex flex-col">
                <span className="text-[#cf5711] font-medium">APY</span>
                <span className="text-2xl text-[#cf5711] font-medium">{formattedVaultApy}</span>
              </div>
            </div>

            <div className="bg-[#f8f8f8] p-4 rounded-lg">
              <div className="flex items-center text-[#7b7b7b]">
                <span>TVL</span>
              </div>
              <span className="text-xl font-medium">{formattedVaultTvl}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Deposit/Withdraw Form */}
        <div>
          <Tabs value={activeTab} onValueChange={changeSelectedTab as (value: string) => void} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="deposit" className="text-lg">
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="text-lg">
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-6">
              <div>
                <label className="text-[#4d4d4d] mb-2 block">Your deposit</label>
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
                <label className="text-[#4d4d4d] block">And receive</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#dfdfdf] rounded-full" />
                  <span className="text-xl">{formattedReceiveAmount}</span>
                </div>
                <div className="text-sm text-[#7b7b7b]">Exchange Rate: {formattedExchangeRate}</div>
              </div>

              <Button className="w-full text-lg py-6" onClick={handleDeposit} disabled={isDepositDisabled || loading}>
                {depositing ? "Depositing..." : "Deposit"}
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-6">
              <div>
                <label className="text-[#4d4d4d] mb-2 block">You withdraw</label>
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
                <label className="text-[#4d4d4d] mb-2 block">And receive</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{formattedReceiveAmount}</span>
                  <TokenSelect
                    tokens={availableTokens}
                    selectedIndex={receiveTokenIndex}
                    onChange={changeSelectedReceiveToken}
                  />
                </div>
              </div>

              <Button className="w-full text-lg py-6" onClick={handleWithdraw} disabled={isWithdrawDisabled || loading}>
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
