import { useParams } from "react-router-dom";

export function Vault() {
  const { vaultId } = useParams();

  return (
    <div>
      <h1>Vault Details</h1>
      <p>Viewing details for vault with ID: {vaultId}</p>
    </div>
  );
}
