import { Link } from "react-router-dom";

export function Vaults() {
  const vaults = [
    { id: "1", name: "Vault One" },
    { id: "2", name: "Vault Two" },
  ];
  return (
    <div>
      <h1>Vaults</h1>
      <ul>
        {vaults.map((vault) => (
          <li key={vault.id}>
            <Link to={`/vault/${vault.id}`}>{vault.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
