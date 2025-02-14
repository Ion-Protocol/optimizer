import { useParams } from "react-router-dom";

export function Vault() {
  const { vaultKey } = useParams();

  return (
    <div>
      <h1>Vault Details</h1>
      <p>Viewing details for vault with key: {vaultKey}</p>
    </div>
  );
}
