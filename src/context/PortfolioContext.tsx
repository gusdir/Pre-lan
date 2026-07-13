import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { START_CASH_EUR } from "../lib/trading";
import { tradingProvider, type OrderInput } from "../lib/trading";
import { depositQuote, withdrawQuote, MIN_DEPOSIT_EUR } from "../lib/account";
import type { Holding, Trade } from "../types";

interface PortfolioState {
  cashEur: number;
  holdings: Record<string, Holding>;
}

interface PortfolioContextValue {
  user: User | null;
  loadingAuth: boolean;
  ready: boolean;
  cashEur: number;
  holdings: Record<string, Holding>;
  trades: Trade[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  executeTrade: (input: OrderInput) => Promise<void>;
  deposit: (amountEur: number) => Promise<void>;
  withdraw: (amountEur: number) => Promise<void>;
  reload: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [ready, setReady] = useState(false);
  const [cashEur, setCashEur] = useState(START_CASH_EUR);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [trades, setTrades] = useState<Trade[]>([]);

  const user = session?.user ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setReady(false);
      return;
    }
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("cash_eur, holdings")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.error(error);
        setReady(true);
        return;
      }
      if (data) {
        setCashEur(Number(data.cash_eur));
        setHoldings((data.holdings as Record<string, Holding>) ?? {});
      } else {
        await supabase.from("portfolios").insert({
          user_id: user.id,
          cash_eur: START_CASH_EUR,
          holdings: {},
        });
      }
      await loadTrades();
      setReady(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadTrades() {
    if (!user) return;
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTrades(data as Trade[]);
  }

  async function persist(state: PortfolioState) {
    if (!user) return;
    await supabase
      .from("portfolios")
      .upsert({ user_id: user.id, cash_eur: state.cashEur, holdings: state.holdings });
  }

  async function executeTrade(input: OrderInput) {
    if (!user) throw new Error("Inicia sesión para operar");
    // El proveedor (demo o real) calcula la orden y el nuevo estado de cartera.
    const result = tradingProvider.placeOrder({ cashEur, holdings }, input);
    setCashEur(result.cashEur);
    setHoldings(result.holdings);
    await persist(result);

    const row = { ...result.trade, user_id: user.id };
    const { data } = await supabase.from("trades").insert(row).select().single();
    if (data) setTrades((prev) => [data as Trade, ...prev]);
  }

  async function deposit(amountEur: number) {
    if (!user) throw new Error("Inicia sesión para operar");
    if (amountEur < MIN_DEPOSIT_EUR)
      throw new Error(`El mínimo es ${MIN_DEPOSIT_EUR} €`);
    const { feeEur, netEur } = depositQuote(amountEur);
    const newCash = cashEur + netEur;
    setCashEur(newCash);
    await persist({ cashEur: newCash, holdings });
    const row = {
      user_id: user.id,
      coin_id: "eur",
      symbol: "eur",
      side: "deposit" as const,
      amount: netEur,
      price_eur: 1,
      value_eur: amountEur,
    };
    const { data } = await supabase.from("trades").insert(row).select().single();
    if (data) setTrades((prev) => [data as Trade, ...prev]);
    void feeEur;
  }

  async function withdraw(amountEur: number) {
    if (!user) throw new Error("Inicia sesión para operar");
    const { feeEur, grossEur } = withdrawQuote(amountEur);
    if (grossEur > cashEur) throw new Error("Saldo insuficiente");
    const newCash = cashEur - grossEur;
    setCashEur(newCash);
    await persist({ cashEur: newCash, holdings });
    const row = {
      user_id: user.id,
      coin_id: "eur",
      symbol: "eur",
      side: "withdraw" as const,
      amount: amountEur,
      price_eur: 1,
      value_eur: grossEur,
    };
    const { data } = await supabase.from("trades").insert(row).select().single();
    if (data) setTrades((prev) => [data as Trade, ...prev]);
    void feeEur;
  }

  const value = useMemo<PortfolioContextValue>(
    () => ({
      user,
      loadingAuth,
      ready,
      cashEur,
      holdings,
      trades,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setCashEur(START_CASH_EUR);
        setHoldings({});
        setTrades([]);
      },
      executeTrade,
      deposit,
      withdraw,
      reload: loadTrades,
    }),
    [user, loadingAuth, ready, cashEur, holdings, trades]
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio debe usarse dentro de PortfolioProvider");
  return ctx;
}
