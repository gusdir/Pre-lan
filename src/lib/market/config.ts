// Mapa de los activos del demo a los productos del WebSocket público de Coinbase.
// Solo se usan los que Coinbase lista en USD (luego convertimos a EUR).
export const PRODUCT_BY_COIN: Record<string, string> = {
  bitcoin: "BTC-USD",
  ethereum: "ETH-USD",
  tether: "USDT-USD",
  binancecoin: "BNB-USD",
  "usd-coin": "USDC-USD",
  ripple: "XRP-USD",
  solana: "SOL-USD",
  cardano: "ADA-USD",
};
