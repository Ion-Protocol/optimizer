import { bigIntToNumberAsString, getEthPrice, getVaultByKey, TokenKey, VaultKey } from "@molecular-labs/nucleus";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { balanceOf } from "../api/contracts/erc20";
import { ApyService } from "../services/ApyService";
import { DepositService } from "../services/DepositService";
import { TvlService } from "../services/TvlService";
import { convertToDecimals } from "../utils/bigint";
import { sanitizeDepositInput } from "../utils/number";

export function useVault() {
  //////////////////////////////
  // Hooks
  //////////////////////////////
  const { vaultKey } = useParams();
  const { address } = useAccount();

  //////////////////////////////
  // Setup
  //////////////////////////////
  const config = useMemo(() => getVaultByKey(vaultKey as VaultKey), [vaultKey]);
  const availableDepositTokens = useMemo(() => Object.values(config.deposit.depositTokens[mainnet.id] || {}), [config]);
  const availableReceiveTokens = useMemo(() => Object.values(config.withdraw.wantTokens[mainnet.id] || {}), [config]);

  //////////////////////////////
  // Component State
  //////////////////////////////
  const [inputValue, setInputValue] = useState<string>("");
  const [depositTokenIndex, setDepositTokenIndex] = useState<number>(0);
  const [receiveTokenIndex, setReceiveTokenIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  //////////////////////////////
  // Component Actions
  //////////////////////////////
  function changeSelectedDepositToken(tokenIndex: number) {
    setDepositTokenIndex(tokenIndex);
  }

  function changeSelectedReceiveToken(tokenIndex: number) {
    setReceiveTokenIndex(tokenIndex);
  }

  function changeInputValue(value: string) {
    setInputValue(sanitizeDepositInput(value, inputValue));
  }

  function changeSelectedTab(tab: "deposit" | "withdraw") {
    setInputValue("");
    setDepositTokenIndex(0);
    setReceiveTokenIndex(0);
    setActiveTab(tab);
  }

  //////////////////////////////
  // Data State
  //////////////////////////////
  // All bigints are 1e18 unless otherwise specified
  const [rateInQuote, setRateInQuote] = useState<string>("0");
  const [previewFee, setPreviewFee] = useState<string>("0");
  const [assetBalance, setAssetBalance] = useState<string>("0");
  const [vaultBalance, setVaultBalance] = useState<string>("0");
  const [vaultApy, setVaultApy] = useState<number>(0);
  const [vaultTvl, setVaultTvl] = useState<string>("0");
  const [ethPerVaultAssetRate, setEthPerVaultAssetRate] = useState<string>("0");
  const [ethPrice, setEthPrice] = useState<string>("0"); // ethPrice is 1e8

  //////////////////////////////
  // Effects for Loading Data
  //////////////////////////////

  // Data that changes when the selected deposit token changes
  useEffect(() => {
    // Rate in quote: The exchange rate between the selected deposit asset and the vault asset
    const fetchRateInQuote = async () => {
      const tokenIndex = activeTab === "deposit" ? depositTokenIndex : receiveTokenIndex;
      try {
        const availableTokens = activeTab === "deposit" ? availableDepositTokens : availableReceiveTokens;
        const rate = await DepositService.getRateInQuote(
          vaultKey as VaultKey,
          availableTokens[tokenIndex].token.key as TokenKey
        );
        setRateInQuote(rate.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch rate in quote:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Preview fee
    const fetchPreviewFee = async () => {
      try {
        if (!address) return;
        const previewFee = await DepositService.getPrevieFee(address, vaultKey as VaultKey);
        setPreviewFee(previewFee.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch rate in quote:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Asset balance
    const fetchAssetBalance = async () => {
      try {
        // If the user is on the deposit tab, the balance shown is the balance of the selected deposit token
        const depositTokenAddress = availableDepositTokens[depositTokenIndex].token.addresses[mainnet.id];
        if (!depositTokenAddress || !address) return;
        const balance = await balanceOf({
          balanceAddress: address,
          tokenAddress: depositTokenAddress,
          chainId: mainnet.id,
        });
        setAssetBalance(balance.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch user balance for selected token:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Execute all fetches in parallel while maintaining individual error handling
    setLoading(true);
    Promise.allSettled([fetchRateInQuote(), fetchPreviewFee(), fetchAssetBalance()]).finally(() => {
      setLoading(false);
    });
  }, [
    activeTab,
    address,
    availableDepositTokens,
    availableReceiveTokens,
    depositTokenIndex,
    receiveTokenIndex,
    vaultKey,
  ]);

  // Data that remains constant with the vault key
  useEffect(() => {
    // Vault balance
    const fetchVaultBalance = async () => {
      try {
        const config = getVaultByKey(vaultKey as VaultKey);
        const tokenAddress = config.token.addresses[mainnet.id];
        if (!tokenAddress || !address) return;
        const balance = await balanceOf({
          balanceAddress: address,
          tokenAddress,
          chainId: mainnet.id,
        });
        setVaultBalance(balance.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch vault balance:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Vault APY
    const fetchVaultApy = async () => {
      try {
        const apy = await ApyService.getApyByVault(vaultKey as VaultKey);
        setVaultApy(apy);
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch vault apy:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Vault TVL
    const fetchVaultTvl = async () => {
      try {
        const tvl = await TvlService.getTvlByVault(vaultKey as VaultKey);
        setVaultTvl(tvl.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch vault tvl:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Eth per vault asset rate
    const fetchEthPerVaultAssetRate = async () => {
      try {
        // Fetching the rate for WETH since it's always the same as ETH
        const rate = await DepositService.getRateInQuote(vaultKey as VaultKey, "weth");
        setEthPerVaultAssetRate(rate.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch eth per vault asset rate:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Eth price
    const fetchEthPrice = async () => {
      try {
        const price = await getEthPrice({ chain: mainnet });
        setEthPrice(price.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch eth price:", err.message);
        setErrors((prevErrors) => [...prevErrors, err.message]);
      }
    };

    // Execute all fetches in parallel while maintaining individual error handling
    setLoading(true);
    Promise.allSettled([
      fetchVaultBalance(),
      fetchVaultApy(),
      fetchVaultTvl(),
      fetchEthPerVaultAssetRate(),
      fetchEthPrice(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [address, vaultKey]);

  //////////////////////////////
  // Derived Values
  //////////////////////////////
  // Available deposit and receive tokens for the select fields taken from the config
  const availableTokens = activeTab === "deposit" ? availableDepositTokens : availableReceiveTokens;

  // Exchange rate
  const formattedExchangeRate = `${
    rateInQuote ? bigIntToNumberAsString(BigInt(rateInQuote), { maximumFractionDigits: 4 }) : "0.00"
  } ${availableTokens[depositTokenIndex].token.symbol} / ${vaultKey}`;

  // Preview fee
  const formattedPreviewFee = previewFee
    ? `${bigIntToNumberAsString(BigInt(previewFee), { maximumFractionDigits: 4 })} ETH`
    : "0.00 ETH";

  // User's asset balance that appears below the input field
  const formattedAssetBalance =
    activeTab === "deposit"
      ? `${bigIntToNumberAsString(BigInt(assetBalance), {
          maximumFractionDigits: 4,
        })} ${availableTokens[depositTokenIndex].token.symbol}`
      : `${bigIntToNumberAsString(BigInt(vaultBalance), {
          maximumFractionDigits: 4,
        })} ${vaultKey}`;

  // Vault balance in both the vault asset and USD that appears in the user's position section
  const usdPerVaultAssetRate = (BigInt(ethPrice) * BigInt(ethPerVaultAssetRate)) / BigInt(1e8);
  const vaultBalanceInUsd = (BigInt(vaultBalance) * usdPerVaultAssetRate) / BigInt(1e18);
  const formattedVaultBalance = bigIntToNumberAsString(BigInt(vaultBalance), {
    maximumFractionDigits: 2,
  });
  const formattedVaultBalanceInUsd = `$${bigIntToNumberAsString(vaultBalanceInUsd, {
    maximumFractionDigits: 2,
  })}`;

  // Receive amount in the vault asset when the deposit tab is selected
  const receiveAmountForDeposit = (BigInt(convertToDecimals(inputValue)) * BigInt(rateInQuote)) / BigInt(1e18);
  const formattedReceiveAmountForDeposit = `${bigIntToNumberAsString(receiveAmountForDeposit, {
    maximumFractionDigits: 2,
  })} ${vaultKey}`;

  // Receive amount in the selected asset when the withdraw tab is selected
  const receiveAmountForWithdraw =
    BigInt(rateInQuote) > BigInt(0)
      ? (BigInt(convertToDecimals(inputValue)) * BigInt(1e18)) / BigInt(rateInQuote)
      : BigInt(0);
  const formattedReceiveAmountForWithdraw = `${bigIntToNumberAsString(receiveAmountForWithdraw, {
    maximumFractionDigits: 2,
  })} ${availableTokens[receiveTokenIndex].token.symbol}`;
  const formattedReceiveAmount =
    activeTab === "deposit" ? formattedReceiveAmountForDeposit : formattedReceiveAmountForWithdraw;

  // Vault APY
  const formattedVaultApy = `${vaultApy.toFixed(2)}%`;

  // Vault TVL
  const tvlInUsdAsBigInt = (BigInt(vaultTvl) * BigInt(ethPrice)) / BigInt(1e18);
  const totalTvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
  const formattedVaultTvl = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(totalTvlInUsd));

  //////////////////////////////
  // Async Actions
  //////////////////////////////

  return {
    formattedExchangeRate,
    formattedPreviewFee,
    formattedAssetBalance,
    formattedVaultBalance,
    formattedVaultBalanceInUsd,
    formattedReceiveAmount,
    formattedVaultApy,
    formattedVaultTvl,
    availableTokens,
    loading,
    errors,
    changeSelectedDepositToken,
    changeSelectedReceiveToken,
    changeInputValue,
    changeSelectedTab,
    activeTab,
    inputValue,
  };
}
