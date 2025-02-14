import { ReactNode } from "react";
import { DashboardProvider } from "../contexts/dashboard/DashboardContext";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <DashboardProvider>
      {/* Add other providers here as needed */}
      {children}
    </DashboardProvider>
  );
};
