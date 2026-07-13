export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export interface Holding {
  coin_id: string;
  symbol: string;
  amount: number;
  avg_cost_eur: number;
}

export interface Trade {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  side: "buy" | "sell" | "deposit" | "withdraw";
  amount: number;
  price_eur: number;
  value_eur: number;
  created_at: string;
}

export type Tab = "mercados" | "operar" | "cartera" | "actividad";

export type KycStatus = "none" | "pending" | "verified";

export interface KycPayload {
  full_name: string;
  document_type: string;
  document_number: string;
  country: string;
}
