import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "./App.css";
import { AppRouter } from "./AppRouter";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { queryClient, wagmiConfig } from "./config/wagmi";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <div className="mx-auto w-[85%] min-w-[500px] max-w-[1500px]">
              <AppHeader />
              <AppRouter />
              <AppFooter />
            </div>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
