import { useCounter } from "../contexts/counter/useCounter";

export function Dashboard() {
  const { count, increment, decrement, doubleCount } = useCounter();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard page.</p>
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
