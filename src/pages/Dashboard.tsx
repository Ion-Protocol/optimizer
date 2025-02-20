import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { VaultGroup } from "../types";
export function Dashboard() {
  const navigate = useNavigate();
  const { totalTvl, vaultGroupData, loading } = useDashboard();

  function handleClickExplore(vaultGroup: VaultGroup) {
    navigate(`/vault-group/${vaultGroup}`);
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Hemi Ecosystem Optimizer</h1>
      <p>Welcome to the dashboard page.</p>
      {loading ? <p>TVL: Loading...</p> : <p>TVL: {totalTvl}</p>}
      <p className="font-bold mt-10">Vaults:</p>
      {loading ? (
        <p>Vaults: Loading...</p>
      ) : (
        vaultGroupData.map((vaultGroup) => (
          <div
            className="flex gap-2 justify-center"
            key={vaultGroup.vaultGroupKey}
          >
            <p>{vaultGroup.vaultGroupKey}: </p>
            <p>{vaultGroup.tvl}</p>
            <p>{vaultGroup.apy}</p>
            <p>Protocols: </p>
            <p>{vaultGroup.protocols.join(", ")}</p>
            <Button
              onClick={() => handleClickExplore(vaultGroup.vaultGroupKey)}
            >
              Explore
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
