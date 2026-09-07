import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  rpcUrl: required("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"),
  jupiterQuoteApi: required("JUPITER_QUOTE_API", "https://quote-api.jup.ag/v6/quote"),

  tokenA: {
    mint: required("TOKEN_A_MINT"),
    decimals: Number(required("TOKEN_A_DECIMALS", "9")),
    symbol: required("TOKEN_A_SYMBOL", "TOKEN_A"),
  },
  tokenB: {
    mint: required("TOKEN_B_MINT"),
    decimals: Number(required("TOKEN_B_DECIMALS", "6")),
    symbol: required("TOKEN_B_SYMBOL", "TOKEN_B"),
  },

  tradeAmount: Number(required("TRADE_AMOUNT", "1")),
  minSpreadPercent: Number(required("MIN_SPREAD_PERCENT", "0.5")),
  pollIntervalMs: Number(required("POLL_INTERVAL_MS", "5000")),
  feeBufferPercent: Number(required("FEE_BUFFER_PERCENT", "0.3")),
};
