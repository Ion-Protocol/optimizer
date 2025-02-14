import { useDashboard } from "../contexts/dashboard/useDashboard";

export function Dashboard() {
  const { totalTvl, vaultData, loading } = useDashboard();
  return (
    <div>
      <h1>Hemi Ecosystem Optimizer</h1>
      <p>Welcome to the dashboard page.</p>
      {loading ? <p>TVL: Loading...</p> : <p>TVL: {totalTvl}</p>}
      <p style={{ fontWeight: "bold", marginTop: "50px" }}>Vaults:</p>
      {loading ? (
        <p>Vaults: Loading...</p>
      ) : (
        vaultData.map((vault) => (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }} key={vault.vaultKey}>
            <p>{vault.vaultKey}: </p>
            <p>{vault.tvl}</p>
          </div>
        ))
      )}
    </div>
  );
}
