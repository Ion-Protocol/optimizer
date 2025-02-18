import { VaultKey } from "@molecular-labs/nucleus";
import { useNavigate, useParams } from "react-router-dom";
import { useVaultGroup } from "../hooks/useVaultGroup";

export function VaultGroup() {
  const { vaultGroup } = useParams();
  const navigate = useNavigate();
  const { vaultsData, totalTvl, loading, error } = useVaultGroup();

  function handleClickVault(vault: VaultKey) {
    navigate(`/vault-group/${vaultGroup}/${vault}`);
  }

  function handleClickBack() {
    navigate(`/`);
  }

  return (
    <div>
      <button onClick={handleClickBack}>Back</button>
      <h3>{vaultGroup}</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total TVL: {totalTvl}</p>
      <ul>
        {vaultsData.map((vault) => (
          <li key={vault.key}>
            <div>
              <p>{vault.key}</p>
              <p>{vault.tvl}</p>
              <p>{vault.apy}</p>
              <p>{vault.rewardsCount} Rewards</p>
            </div>
            <button onClick={() => handleClickVault(vault.key)}>Deposit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
