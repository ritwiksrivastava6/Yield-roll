export type Instrument = {
  symbol: string;
  name: string;
  role: "index" | "etf" | "stock" | "future" | "fx" | "rate" | "vol";
  note?: string;
  digits?: number;
  percent?: boolean;
};
