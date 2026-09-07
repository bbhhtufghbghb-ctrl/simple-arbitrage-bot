import fetch from "node-fetch";
import { config } from "./config.js";

function toBaseUnits(amount, decimals) {
  return Math.round(amount * 10 ** decimals).toString();
}

function fromBaseUnits(amount, decimals) {
  return Number(amount) / 10 ** decimals;
}

async function getQuote(inputMint, outputMint, amountBaseUnits) {
  const url = new URL(config.jupiterQuoteApi);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amountBaseUnits);
  url.searchParams.set("slippageBps", "50");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Jupiter quote request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function checkSpreadOnce() {
  const { tokenA, tokenB, tradeAmount } = config;

  const startAmountBaseUnits = toBaseUnits(tradeAmount, tokenA.decimals);

  const legOne = await getQuote(tokenA.mint, tokenB.mint, startAmountBaseUnits);
  const receivedB = legOne.outAmount;

  const legTwo = await getQuote(tokenB.mint, tokenA.mint, receivedB);
  const finalA = fromBaseUnits(legTwo.outAmount, tokenA.decimals);

  const grossSpreadPercent = ((finalA - tradeAmount) / tradeAmount) * 100;
  const netSpreadPercent = grossSpreadPercent - config.feeBufferPercent;

  const timestamp = new Date().toISOString();
  const summary = `[${timestamp}] Start ${tradeAmount} ${tokenA.symbol} -> ` +
    `${fromBaseUnits(receivedB, tokenB.decimals).toFixed(6)} ${tokenB.symbol} -> ` +
    `${finalA.toFixed(6)} ${tokenA.symbol} | gross ${grossSpreadPercent.toFixed(3)}% | ` +
    `net (after fee buffer) ${netSpreadPercent.toFixed(3)}%`;

  console.log(summary);

  if (netSpreadPercent >= config.minSpreadPercent) {
    console.log(`  >>> Potential opportunity: net spread ${netSpreadPercent.toFixed(3)}% ` +
      `meets your ${config.minSpreadPercent}% threshold.`);
  }
}

async function main() {
  console.log("Starting Solana arbitrage scanner (test mode, no trades executed).");
  console.log(`Pair: ${config.tokenA.symbol} <-> ${config.tokenB.symbol}`);
  console.log(`Polling every ${config.pollIntervalMs} ms\n`);

  while (true) {
    try {
      await checkSpreadOnce();
    } catch (err) {
      console.error(`Error checking spread: ${err.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
}

main();
