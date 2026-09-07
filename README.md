# Solana Simple Arbitrage Scanner (Test Bot)

A very minimal bot that checks price differences (spreads) for a token
pair across two Solana DEX routes using the Jupiter Aggregator API.

This is a price-difference scanner only. It does not execute any
trades. It just prints potential arbitrage opportunities to the console.

## Setup

npm install
cp .env.example .env
npm start
