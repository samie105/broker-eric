import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Common cryptocurrency names mapping
const coinNames = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  USDC: "USD Coin",
  BNB: "Binance Coin",
  XRP: "Ripple",
  ADA: "Cardano",
  SOL: "Solana",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  DAI: "Dai",
  AVAX: "Avalanche",
  MATIC: "Polygon",
  SHIB: "Shiba Inu",
  TRX: "Tron",
  UNI: "Uniswap",
  LTC: "Litecoin",
  LINK: "Chainlink",
  ETC: "Ethereum Classic",
  XLM: "Stellar",
  XMR: "Monero",
  ALGO: "Algorand",
  MANA: "Decentraland",
  AXS: "Axie Infinity",
  CRO: "Crypto.com Coin",
  AAVE: "Aave",
  GRT: "The Graph",
  VET: "VeChain",
  SUSHI: "SushiSwap",
};

export async function GET() {
  try {
    // Path to crypto icons directory
    const cryptoIconsDir = path.join(process.cwd(), "public", "assets", "markets", "crypto");
    
    // Read the directory
    const files = fs.readdirSync(cryptoIconsDir);
    
    // Filter for SVG files
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    // Create coin objects with symbol and name
    const coins = svgFiles.map(file => {
      const symbol = file.replace('.svg', '');
      return {
        symbol,
        name: coinNames[symbol] || symbol // Use mapping or fallback to symbol
      };
    });
    
    // Sort coins by name
    coins.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({ coins });
  } catch (error) {
    console.error("Error fetching available coins:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch available coins" },
      { status: 500 }
    );
  }
} 