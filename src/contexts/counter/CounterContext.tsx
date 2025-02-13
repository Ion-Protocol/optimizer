import { createContext, useState, useMemo, ReactNode } from "react";
import { CounterContextType } from "./counterTypes";

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [count, setCount] = useState<number>(0);

  // Derived state
  const doubleCount = useMemo(() => count * 2, [count]);

  // Actions
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  // Context value
  const value = useMemo(() => ({ count, doubleCount, increment, decrement }), [count, doubleCount]);

  // Provider
  return <CounterContext.Provider value={value}>{children}</CounterContext.Provider>;
};

export { CounterContext };
