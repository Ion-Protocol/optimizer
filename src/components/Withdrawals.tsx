import { useWithdrawals } from "../hooks/useWithdrawals";

export function Withdrawals() {
  const { withdrawals } = useWithdrawals();

  return (
    <div>
      <h1>Your Transactions</h1>
      <pre style={{ textAlign: "left", height: "500px", overflow: "auto", border: "1px solid white" }}>
        {JSON.stringify(withdrawals, null, 2)}
      </pre>
    </div>
  );
}
