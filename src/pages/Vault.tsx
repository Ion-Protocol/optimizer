import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useVault } from "../hooks/useVault";

export function Vault() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { vaultGroup, vaultKey } = useParams();
  const {
    activeTab,
    approvalStatus,
    availableTokens,
    changeInputValue,
    changeSelectedDepositToken,
    changeSelectedReceiveToken,
    changeSelectedTab,
    depositStatus,
    error,
    formattedAssetBalance,
    formattedExchangeRate,
    formattedReceiveAmount,
    formattedVaultApy,
    formattedVaultBalance,
    formattedVaultBalanceInUsd,
    formattedVaultTvl,
    formattedPreviewFee,
    handleDeposit,
    handleWithdraw,
    inputValue,
    isDepositDisabled,
    isWithdrawDisabled,
    loading,
  } = useVault();

  function handleClickBack() {
    navigate(`/vault-group/${vaultGroup}`);
  }

  return (
    <div>
      <h1>Vault Details</h1>
      <button onClick={handleClickBack}>Back</button>
      <p>Viewing details for vault with key: {vaultKey}</p>
      {loading && <p>Loading...</p>}

      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", gap: "100px" }}>
          <div>
            <p>
              Vault Balance: {formattedVaultBalance} {vaultKey} = {formattedVaultBalanceInUsd}
            </p>
            <p>Vault APY: {formattedVaultApy}</p>
            <p>Vault TVL: {formattedVaultTvl}</p>
          </div>
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <h3>Temp Tabs</h3>
              <button
                onClick={() => changeSelectedTab("deposit")}
                style={{
                  fontWeight: activeTab === "deposit" ? "bold" : "normal",
                  backgroundColor: activeTab === "deposit" ? "#eee" : "transparent",
                }}
              >
                Deposit
              </button>
              <button
                onClick={() => changeSelectedTab("withdraw")}
                style={{
                  fontWeight: activeTab === "withdraw" ? "bold" : "normal",
                  backgroundColor: activeTab === "withdraw" ? "#eee" : "transparent",
                }}
              >
                Withdraw
              </button>
            </div>
            {activeTab === "deposit" && (
              <div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input value={inputValue} onChange={(e) => changeInputValue(e.target.value)} />
                  <select onChange={(e) => changeSelectedDepositToken(Number(e.target.value))}>
                    {availableTokens.map((token, index) => (
                      <option key={token.token.symbol} value={index}>
                        {token.token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <p>Asset Balance: {formattedAssetBalance}</p>
                <p>Exchange Rate: {formattedExchangeRate}</p>
                <p>Receive: {formattedReceiveAmount}</p>
                <p>Bridge Fee: {formattedPreviewFee}</p>
                {isConnected ? (
                  <button onClick={handleDeposit} disabled={isDepositDisabled}>
                    {approvalStatus === "processing" || depositStatus === "processing" ? "Depositing..." : "Deposit"}
                  </button>
                ) : (
                  <button onClick={openConnectModal}>Connect Wallet</button>
                )}
              </div>
            )}
            {activeTab === "withdraw" && (
              <div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input value={inputValue} onChange={(e) => changeInputValue(e.target.value)} />
                </div>
                <p>Asset Balance: {formattedAssetBalance}</p>
                <p>Exchange Rate: {formattedExchangeRate}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <p>Receive: {formattedReceiveAmount}</p>
                  <select onChange={(e) => changeSelectedReceiveToken(Number(e.target.value))}>
                    {availableTokens.map((token, index) => (
                      <option key={token.token.symbol} value={index}>
                        {token.token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <p>Bridge Fee: {formattedPreviewFee}</p>
                {isConnected ? (
                  <button onClick={handleWithdraw} disabled={isWithdrawDisabled}>
                    Withdraw
                  </button>
                ) : (
                  <button onClick={openConnectModal}>Connect Wallet</button>
                )}
              </div>
            )}
            <p>Approval Status: {approvalStatus}</p>
            <p>Deposit Status: {depositStatus}</p>
            {error && (
              <div>
                <h3 style={{ color: "pink" }}>Error</h3>
                <pre style={{ color: "pink", maxWidth: "400px", whiteSpace: "pre-wrap" }}>{error}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
