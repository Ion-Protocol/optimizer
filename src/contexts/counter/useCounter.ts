import { useContext } from "react";
import { CounterContext } from "./CounterContext";
import { CounterContextType } from "./counterTypes";

export const useCounter = (): CounterContextType => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
};
