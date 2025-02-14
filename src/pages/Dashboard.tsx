import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/dashboard/useDashboard";
import { VaultGroup } from "../types";

export function Dashboard() {
  const navigate = useNavigate();
  const { totalTvl, vaultGroupData, loading } = useDashboard();

  function handleClickExplore(vaultGroup: VaultGroup) {
    navigate(`/vault-group/${vaultGroup}`);
  }
  return (
    <div>
      <h1>Hemi Ecosystem Optimizer</h1>
      <p>Welcome to the dashboard page.</p>
      {loading ? <p>TVL: Loading...</p> : <p>TVL: {totalTvl}</p>}
      <p style={{ fontWeight: "bold", marginTop: "50px" }}>Vaults:</p>
      {loading ? (
        <p>Vaults: Loading...</p>
      ) : (
        vaultGroupData.map((vaultGroup) => (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }} key={vaultGroup.vaultGroupKey}>
            <p>{vaultGroup.vaultGroupKey}: </p>
            <p>{vaultGroup.tvl}</p>
            <p>{vaultGroup.apy}</p>
            <p>Protocols: </p>
            <p>{vaultGroup.protocols.join(", ")}</p>
            <button onClick={() => handleClickExplore(vaultGroup.vaultGroupKey)}>Explore</button>
          </div>
        ))
      )}
    </div>
  );
}
