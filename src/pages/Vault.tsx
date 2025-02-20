import { DepositWithdraw } from "../components/DepositWithdraw";
import { Withdrawals } from "../components/Withdrawals";

export function Vault() {
  return (
    <div>
      <DepositWithdraw />
      <Withdrawals />
    </div>
  );
}
