import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Telescope } from "lucide-react";

interface TokenMultiplier {
  symbol: string;
  multiplier: number;
  color: string;
}

interface TokenValue {
  symbol: string;
  value: number;
  color: string;
}

interface RewardsTooltipProps {
  rewardsCount: number;
}

export function RewardsTooltip({ rewardsCount }: RewardsTooltipProps) {
  const multipliers: TokenMultiplier[] = [
    { symbol: "ETH", multiplier: 3.0, color: "bg-blue-500" },
    { symbol: "BTC", multiplier: 1.5, color: "bg-orange-500" },
  ];

  const tokens: TokenValue[] = [
    { symbol: "MKR", value: 128.2, color: "bg-emerald-500" },
    { symbol: "TEL", value: 67.9, color: "bg-cyan-400" },
    { symbol: "UNI", value: 48.6, color: "bg-pink-500" },
    { symbol: "REN", value: 48.6, color: "bg-zinc-800" },
  ];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="font-mono text-xl font-sm text-[#1F180F] cursor-pointer rounded-full border border-[#DFDFDF] px-3 py-1 transition-colors hover:bg-[#FFC39E] hover:border-[#FF6C15]">
            {rewardsCount} Rewards
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-[400px] p-0 bg-transparent border-none">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-lg border border-[#DFDFDF]">
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-medium text-gray-900">Multipliers</h2>
                <div className="space-y-3">
                  {multipliers.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full ${token.color}`} />
                        <span className="text-lg text-gray-600">{token.symbol}</span>
                      </div>
                      <span className="text-lg font-medium text-orange-600">×{token.multiplier.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-medium text-gray-900">Tokens</h2>
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full ${token.color}`} />
                        <span className="text-lg text-gray-600">{token.symbol}</span>
                      </div>
                      <span className="text-lg font-medium text-orange-600">+{token.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl pl-[1px]">
                <div className="relative w-full h-[40px] overflow-hidden rounded-lg">
                  <div className="absolute w-[500px] h-[400px] top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="absolute inset-0 rounded-full animate-spin-reverse-slow"
                      style={{
                        background: "conic-gradient(from 0deg, #FF6C15, transparent 50%)",
                      }}
                    />
                  </div>

                  <div className="absolute inset-[2px] bg-white rounded-lg border border-[#DFDFDF] ">
                    <div className="flex h-full items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Telescope className="h-5 w-5 text-orange-600" />
                        <span className="text-lg font-medium text-gray-900">Net APY</span>
                      </div>
                      <span className="text-lg font-medium text-orange-600">9.92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
