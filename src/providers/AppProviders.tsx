import { ReactNode } from "react";
import { CounterProvider } from "../contexts/counter/CounterContext";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <CounterProvider>
      {/* Add other providers here as needed */}
      {children}
    </CounterProvider>
  );
};
