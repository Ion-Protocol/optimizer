import { useNavigate, useParams } from "react-router-dom";
import { useVault } from "../hooks/useVault";

export function Vault() {
  const navigate = useNavigate();
  const {
    formattedExchangeRate,
    formattedAssetBalance,
    formattedVaultBalance,
    formattedVaultBalanceInUsd,
    formattedReceiveAmount,
    formattedVaultApy,
    formattedVaultTvl,
    availableTokens,
    loading,
    activeTab,
    inputValue,
    changeSelectedTab,
    changeInputValue,
    changeSelectedDepositToken,
    changeSelectedReceiveToken,
  } = useVault();
  const { vaultGroup, vaultKey } = useParams();

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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
