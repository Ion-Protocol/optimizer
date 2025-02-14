import { VaultKey } from "@molecular-labs/nucleus";
import { useNavigate, useParams } from "react-router-dom";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { VaultGroup } from "../types";

export function Vaults() {
  const { vaultGroup } = useParams();
  const navigate = useNavigate();
  const vaults = vaultGroupsConfig[vaultGroup as VaultGroup].vaults;

  function handleClickVault(vault: VaultKey) {
    navigate(`/vault/${vault}`);
  }
  return (
    <div>
      <h3>{vaultGroup}</h3>
      <ul>
        {vaults.map((vault) => (
          <li key={vault}>
            <button onClick={() => handleClickVault(vault)}>{vault}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
