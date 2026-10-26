export type Bar = {
  d: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
};

export type Quote = {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  tz: string;
  price: number;
  changePct: number | null;
  volume: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  high52: number | null;
  low52: number | null;
  asOf: string;
  asOfLabel: string;
  spark: { d: string; c: number }[];
};

export type Board = {
  fetchedAt: string;
  fetchedAtLabel: string;
  source: string;
  quotes: Quote[];
  errors: { symbol: string; message: string }[];
};

export type Series = {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  tz: string;
  price: number;
  changePct: number | null;
  asOf: string;
  asOfLabel: string;
  bars: Bar[];
  adjusted: boolean;
};

export type SeriesResult = { ok: true; series: Series } | { ok: false; symbol: string; message: string };

export type WbPoint = { year: string; values: Record<string, number | null> };

export type WbLatest = { year: string; value: number };

export type WbSeries = {
  id: string;
  name: string;
  unit: string;
  digits: number;
  points: WbPoint[];
  latest: Record<string, WbLatest | null>;
  error?: string;
};

export type WbBundle = {
  countries: string[];
  updated: string | null;
  series: WbSeries[];
};

export type FxRate = { code: string; name: string; rate: number };

export type SearchHit = {
  symbol: string;
  name: string;
  exchange: string;
  exchDisp: string;
  type: string;
};

export type NewsItem = {
  title: string;
  link: string;
  published: string;
  publishedLabel: string;
  source: string;
  symbol: string;
  summary: string;
};

export type NewsBundle = {
  fetchedAtLabel: string;
  source: string;
  query: string;
  items: NewsItem[];
  error?: string;
};

export type DegreePoint = {
  d: string;
  hdd: number | null;
  wind: number | null;
  ng: number | null;
  cl: number | null;
};

export type StorageRegion = {
  name: string;
  latest: number;
  weekAgo: number | null;
  yearAgo: number | null;
  change: number | null;
  avg5: number | null;
  unit: string;
};

export type PetroleumRow = {
  name: string;
  latest: number;
  weekAgo: number | null;
  change: number | null;
  yearAgo: number | null;
};

export type FreightQuote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number | null;
  asOfLabel: string;
  note: string;
};

export type EnergyContext = {
  fetchedAtLabel: string;
  today: string;
  formula: string;
  weatherSource: string;
  weatherError?: string;
  derivedMeanDays: number;
  history: DegreePoint[];
  forecast: { d: string; hdd: number | null; wind: number | null }[];
  gasCorr: { n: number; ret: number | null; level: number | null; symbol: string } | null;
  windCorr: { n: number; ret: number | null; symbol: string } | null;
  storage: { release: string; week: string; regions: StorageRegion[]; error?: string };
  petroleum: { week: string; rows: PetroleumRow[]; unit: string; error?: string };
  freight: FreightQuote[];
  freightNote: string;
};

export type Print = {
  symbol: string;
  price: number;
  changePct: number | null;
  asOf: string | null;
  asOfLabel: string | null;
};

export type PrintBoard = {
  fetchedAt: string;
  fetchedAtLabel: string;
  source: string;
  prints: Print[];
  errors: { symbol: string; message: string }[];
};

export type MacroBundle = {
  fetchedAt: string;
  fetchedAtLabel: string;
  wbCountries: string[];
  wbUpdated: string | null;
  wb: WbSeries[];
  market: Quote[];
  marketErrors: { symbol: string; message: string }[];
  marketSource: string;
};

export type OptionContract = {
  contract: string;
  type: "call" | "put";
  strike: number;
  bid: number | null;
  ask: number | null;
  last: number | null;
  iv: number | null;
  volume: number | null;
  openInterest: number | null;
  delta: number | null;
  gamma: number | null;
  vega: number | null;
  theta: number | null;
};

export type OptionChain = {
  symbol: string;
  spot: number | null;
  dividendYield: number | null;
  rate: number | null;
  expiry: string;
  expiries: string[];
  rows: OptionContract[];
  source: string;
  error?: string;
};

export type SurfacePoint = {
  expiry: string;
  strike: number;
  iv: number;
  side: "call" | "put";
};

export type VolSurface = {
  symbol: string;
  spot: number | null;
  points: SurfacePoint[];
  source: string;
  error?: string;
};

export type ReferenceFx = {
  date: string;
  rates: { code: string; perUsd: number }[];
  source: string;
  error?: string;
};

export type OfficialRates = {
  date: string;
  curve: { label: string; yield: number | null }[];
  sofr: { date: string; rate: number } | null;
  effr: { date: string; rate: number } | null;
  source: string;
  error?: string;
};

export type FilingRow = { form: string; filed: string; url: string };

export type FilingStrip = {
  symbol: string;
  name: string;
  filings: FilingRow[];
  source: string;
  error?: string;
};

export type CotRow = {
  symbol: string;
  market: string;
  reportDate: string;
  openInterest: number;
  long: number;
  short: number;
  spread: number;
};

export type CotBook = {
  rows: CotRow[];
  source: string;
  error?: string;
};

export type EcbHistory = {
  symbol: string;
  points: { d: string; rate: number }[];
  source: string;
  error?: string;
};

export type Basket = {
  range: string;
  results: SeriesResult[];
};

