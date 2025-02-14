import { useDashboard } from "../contexts/dashboard/useDashboard";

export function Dashboard() {
  const { totalTvl } = useDashboard();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard page.</p>
      <p>TVL: {totalTvl}</p>
    </div>
  );
}
