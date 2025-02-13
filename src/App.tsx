import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "./App.css";
import { AppRouter } from "./AppRouter";
import { AppHeader } from "./components/AppHeader";
import { queryClient, wagmiConfig } from "./config/wagmi";

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppHeader />
          <AppRouter />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
