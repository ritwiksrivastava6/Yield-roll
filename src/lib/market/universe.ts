import type { Instrument } from "./universe-types";

export type { Instrument };

export type SegmentId = "us" | "india" | "gold" | "silver" | "gas" | "crude";

export type Segment = {
  id: SegmentId;
  path: string;
  nav: string;
  kicker: string;
  title: string;
  lede: string;
  caveat: string;
  benchmark: string;
  symbols: Instrument[];
  context: Instrument[];
  fetch: string[];
};

const usStocks: Instrument[] = [
  { symbol: "^GSPC", name: "S&P 500", role: "index" },
  { symbol: "^DJI", name: "Dow Jones", role: "index" },
  { symbol: "^IXIC", name: "Nasdaq Composite", role: "index" },
  { symbol: "^RUT", name: "Russell 2000", role: "index" },
  { symbol: "^VIX", name: "CBOE VIX", role: "vol", digits: 2 },
  { symbol: "SPY", name: "SPDR S&P 500", role: "etf", note: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ", role: "etf", note: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", role: "etf", note: "ETF" },
  { symbol: "XLF", name: "Financials Select", role: "etf", note: "Sector ETF" },
  { symbol: "XLE", name: "Energy Select", role: "etf", note: "Sector ETF" },
  { symbol: "XLK", name: "Technology Select", role: "etf", note: "Sector ETF" },
  { symbol: "AAPL", name: "Apple", role: "stock" },
  { symbol: "MSFT", name: "Microsoft", role: "stock" },
  { symbol: "NVDA", name: "NVIDIA", role: "stock" },
  { symbol: "AMZN", name: "Amazon", role: "stock" },
  { symbol: "GOOGL", name: "Alphabet", role: "stock" },
  { symbol: "META", name: "Meta", role: "stock" },
  { symbol: "BRK-B", name: "Berkshire Hathaway", role: "stock" },
  { symbol: "JPM", name: "JPMorgan", role: "stock" },
  { symbol: "XOM", name: "Exxon Mobil", role: "stock" },
  { symbol: "UNH", name: "UnitedHealth", role: "stock" },
];

const indiaStocks: Instrument[] = [
  { symbol: "^NSEI", name: "Nifty 50", role: "index" },
  { symbol: "^BSESN", name: "BSE Sensex", role: "index" },
  { symbol: "^NSEBANK", name: "Nifty Bank", role: "index" },
  { symbol: "NIFTYBEES.NS", name: "Nippon Nifty BeES", role: "etf", note: "NSE ETF" },
  { symbol: "BANKBEES.NS", name: "Nippon Bank BeES", role: "etf", note: "NSE ETF" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", role: "stock" },
  { symbol: "TCS.NS", name: "TCS", role: "stock" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", role: "stock" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", role: "stock" },
  { symbol: "INFY.NS", name: "Infosys", role: "stock" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", role: "stock" },
  { symbol: "SBIN.NS", name: "State Bank of India", role: "stock" },
  { symbol: "LT.NS", name: "Larsen & Toubro", role: "stock" },
  { symbol: "ITC.NS", name: "ITC", role: "stock" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", role: "stock" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", role: "stock" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma", role: "stock" },
];

const rates: Instrument[] = [
  { symbol: "^IRX", name: "13-week Treasury", role: "rate", digits: 3, percent: true, note: "CBOE yield index" },
  { symbol: "^FVX", name: "5-year Treasury", role: "rate", digits: 3, percent: true, note: "CBOE yield index" },
  { symbol: "^TNX", name: "10-year Treasury", role: "rate", digits: 3, percent: true, note: "CBOE yield index" },
  { symbol: "^TYX", name: "30-year Treasury", role: "rate", digits: 3, percent: true, note: "CBOE yield index" },
];

const dxy: Instrument = { symbol: "DX-Y.NYB", name: "US Dollar Index", role: "fx", digits: 3, note: "ICE" };
const inr: Instrument = { symbol: "INR=X", name: "USD / INR", role: "fx", digits: 4, note: "Yahoo FX" };
const vix: Instrument = { symbol: "^VIX", name: "CBOE VIX", role: "vol", digits: 2 };

function seg(partial: Omit<Segment, "fetch">): Segment {
  const symbols = [...partial.symbols, ...partial.context].map((s) => s.symbol);
  return { ...partial, fetch: [...new Set(symbols)] };
}

export const SEGMENTS: Record<SegmentId, Segment> = {
  us: seg({
    id: "us",
    path: "/us",
    nav: "US equities",
    kicker: "Cash equities",
    title: "United States",
    lede: "Indices, sector ETFs, and large-cap names. Daily bars and the latest print come from Yahoo Finance. RSI, moving averages, MACD, Bollinger, ATR, and realized volatility are calculated here from those bars.",
    caveat:
      "Headline prices are the latest Yahoo print. Charts use split- and dividend-adjusted closes when Yahoo supplies them, so a long history is not distorted by a split. Nothing on this page is a model fill.",
    benchmark: "^GSPC",
    symbols: usStocks,
    context: [rates[0], rates[2], rates[3], dxy],
  }),
  india: seg({
    id: "india",
    path: "/india",
    nav: "India equities",
    kicker: "NSE and BSE",
    title: "Indian equities",
    lede: "Nifty, Sensex, Bank Nifty, and liquid NSE names via Yahoo’s India listings. There is no keyless official NSE feed, so a symbol that Yahoo does not carry is left blank rather than estimated.",
    caveat:
      "These are exchange-listed prices as Yahoo reports them, not a broker’s depth-of-book. ETF rows are funds, not the index itself. Adjusted closes are used on the chart when Yahoo provides them.",
    benchmark: "^NSEI",
    symbols: indiaStocks,
    context: [inr, rates[2], vix],
  }),
  gold: seg({
    id: "gold",
    path: "/gold",
    nav: "Gold",
    kicker: "Bullion",
    title: "Gold",
    lede: "COMEX gold futures (GC=F), US bullion ETFs, and Nippon Gold BeES on the NSE. An INR-per-10g cross is shown only as arithmetic on those two live inputs, and it is labeled as a cross — not an MCX print.",
    caveat:
      "GC=F is a futures contract, GLD and IAU are US funds, and GOLDBEES.NS is an Indian ETF. None of them is the LBMA spot fix. The INR cross ignores duty, GST, and local premium.",
    benchmark: "GC=F",
    symbols: [
      { symbol: "GC=F", name: "COMEX gold", role: "future", digits: 2, note: "USD / troy oz" },
      { symbol: "GLD", name: "SPDR Gold Shares", role: "etf", note: "US ETF" },
      { symbol: "IAU", name: "iShares Gold Trust", role: "etf", note: "US ETF" },
      { symbol: "GOLDBEES.NS", name: "Nippon Gold BeES", role: "etf", note: "NSE gold ETF, INR" },
    ],
    context: [
      { symbol: "SI=F", name: "COMEX silver", role: "future", digits: 3, note: "For the gold/silver ratio" },
      inr,
      rates[2],
      dxy,
    ],
  }),
  silver: seg({
    id: "silver",
    path: "/silver",
    nav: "Indian silver",
    kicker: "Bullion",
    title: "Indian silver",
    lede: "Nippon Silver BeES is the India-listed series. COMEX silver (SI=F) and the US SLV fund sit beside it so the domestic ETF can be read against the global contract. The INR-per-kg figure is a labeled cross, not an MCX settlement.",
    caveat:
      "MCX silver does not publish a keyless official quote, so it is not shown. Silver BeES can trade at a premium or discount to bullion. The cross ignores duty, GST, and that premium.",
    benchmark: "SILVERBEES.NS",
    symbols: [
      { symbol: "SILVERBEES.NS", name: "Nippon Silver BeES", role: "etf", note: "NSE silver ETF, INR" },
      { symbol: "SI=F", name: "COMEX silver", role: "future", digits: 3, note: "USD / troy oz" },
      { symbol: "SLV", name: "iShares Silver Trust", role: "etf", note: "US ETF" },
    ],
    context: [
      { symbol: "GC=F", name: "COMEX gold", role: "future", digits: 2, note: "For the gold/silver ratio" },
      inr,
      rates[2],
    ],
  }),
  gas: seg({
    id: "gas",
    path: "/gas",
    nav: "Natural gas",
    kicker: "Energy",
    title: "Natural gas",
    lede: "NYMEX Henry Hub futures (NG=F) are the liquid public benchmark. UNG is the US futures ETF, not the hub price. GAIL is an Indian gas utility equity, not a gas molecule.",
    caveat:
      "No keyless MCX natural-gas print is available, so none is invented. UNG’s long-run path diverges from the hub because the fund rolls futures. GAIL’s share price is a company, not a commodity.",
    benchmark: "NG=F",
    symbols: [
      { symbol: "NG=F", name: "NYMEX Henry Hub", role: "future", digits: 3, note: "USD / mmBtu" },
      { symbol: "UNG", name: "US Natural Gas Fund", role: "etf", note: "ETF, not the hub" },
      { symbol: "GAIL.NS", name: "GAIL India", role: "stock", note: "Gas utility equity" },
    ],
    context: [
      { symbol: "CL=F", name: "WTI crude", role: "future", digits: 2, note: "Energy complex" },
      vix,
    ],
  }),
  crude: seg({
    id: "crude",
    path: "/crude",
    nav: "Crude oil",
    kicker: "Energy",
    title: "Crude oil",
    lede: "Brent (BZ=F) is the benchmark most Indian cargoes reference. WTI (CL=F) is the NYMEX contract. USO is an ETF. ONGC and Reliance are equities with oil exposure, not a barrel price and not the PPAC Indian basket.",
    caveat:
      "The Indian crude basket is not published on a keyless API, so it is omitted. Futures are contracts with expiry; the Yahoo series is the front continuation as they publish it.",
    benchmark: "BZ=F",
    symbols: [
      { symbol: "BZ=F", name: "Brent crude", role: "future", digits: 2, note: "USD / barrel" },
      { symbol: "CL=F", name: "WTI crude", role: "future", digits: 2, note: "USD / barrel" },
      { symbol: "USO", name: "US Oil Fund", role: "etf", note: "ETF, not the barrel" },
      { symbol: "ONGC.NS", name: "ONGC", role: "stock", note: "Upstream equity" },
      { symbol: "RELIANCE.NS", name: "Reliance Industries", role: "stock", note: "Conglomerate, not a barrel" },
    ],
    context: [dxy, inr, vix],
  }),
};

export const SEGMENT_LIST: Segment[] = [
  SEGMENTS.us,
  SEGMENTS.india,
  SEGMENTS.gold,
  SEGMENTS.silver,
  SEGMENTS.gas,
  SEGMENTS.crude,
];

export const YIELD_SYMBOLS = ["^IRX", "^FVX", "^TNX", "^TYX"] as const;

export const MACRO_PRINTS = [
  { symbol: "^GSPC", label: "US", name: "S&P 500", digits: 2 },
  { symbol: "^STOXX50E", label: "EMEA", name: "Euro Stoxx 50", digits: 2 },
  { symbol: "^NSEI", label: "India", name: "Nifty 50", digits: 2 },
  { symbol: "^N225", label: "APAC", name: "Nikkei 225", digits: 2 },
] as const;

export const MACRO_MARKET_SYMBOLS = MACRO_PRINTS.map((row) => row.symbol);

export const WB_COUNTRIES = [
  { id: "US", iso3: "USA", label: "United States" },
  { id: "CN", iso3: "CHN", label: "China" },
  { id: "JP", iso3: "JPN", label: "Japan" },
  { id: "IN", iso3: "IND", label: "India" },
  { id: "DE", iso3: "DEU", label: "Germany" },
  { id: "GB", iso3: "GBR", label: "United Kingdom" },
  { id: "FR", iso3: "FRA", label: "France" },
  { id: "KR", iso3: "KOR", label: "Korea" },
  { id: "AU", iso3: "AUS", label: "Australia" },
  { id: "CA", iso3: "CAN", label: "Canada" },
  { id: "BR", iso3: "BRA", label: "Brazil" },
  { id: "ZA", iso3: "ZAF", label: "South Africa" },
  { id: "SA", iso3: "SAU", label: "Saudi Arabia" },
  { id: "ID", iso3: "IDN", label: "Indonesia" },
  { id: "MX", iso3: "MEX", label: "Mexico" },
] as const;

export const WB_DEFAULT = ["US", "IN"] as const;

const bySymbol = new Map<string, Instrument>();
for (const segment of SEGMENT_LIST) {
  for (const item of [...segment.symbols, ...segment.context]) {
    if (!bySymbol.has(item.symbol)) bySymbol.set(item.symbol, item);
  }
}
for (const item of rates) {
  if (!bySymbol.has(item.symbol)) bySymbol.set(item.symbol, item);
}

export function instrumentOf(symbol: string): Instrument | undefined {
  return bySymbol.get(symbol);
}

export const deskGroups: { title: string; items: { symbol: string; href: string }[] }[] = [
  {
    title: "Equities",
    items: [
      { symbol: "^GSPC", href: "/us" },
      { symbol: "^IXIC", href: "/us" },
      { symbol: "^NSEI", href: "/india" },
      { symbol: "^BSESN", href: "/india" },
      { symbol: "^NSEBANK", href: "/india" },
    ],
  },
  {
    title: "Bullion and energy",
    items: [
      { symbol: "GC=F", href: "/gold" },
      { symbol: "GOLDBEES.NS", href: "/gold" },
      { symbol: "SI=F", href: "/silver" },
      { symbol: "SILVERBEES.NS", href: "/silver" },
      { symbol: "NG=F", href: "/gas" },
      { symbol: "BZ=F", href: "/crude" },
      { symbol: "CL=F", href: "/crude" },
    ],
  },
  {
    title: "Rates and FX",
    items: [
      { symbol: "^TNX", href: "/rates" },
      { symbol: "^IRX", href: "/rates" },
      { symbol: "^VIX", href: "/equities" },
      { symbol: "DX-Y.NYB", href: "/fx" },
      { symbol: "INR=X", href: "/fx" },
    ],
  },
];

export const DESK_SYMBOLS = [...new Set(deskGroups.flatMap((g) => g.items.map((i) => i.symbol)))];

export const LAB_GROUPS: { label: string; symbols: { symbol: string; name: string }[] }[] = SEGMENT_LIST.map(
  (segment) => ({
    label: segment.nav,
    symbols: segment.symbols.map((s) => ({ symbol: s.symbol, name: s.name })),
  }),
);

export const RANGES = ["3mo", "6mo", "1y", "2y", "5y", "10y"] as const;
export type RangeKey = (typeof RANGES)[number];

export const WB_INDICATORS: {
  id: string;
  name: string;
  unit: string;
  digits: number;
}[] = [
  { id: "NY.GDP.MKTP.KD.ZG", name: "Real GDP growth", unit: "%", digits: 2 },
  { id: "FP.CPI.TOTL.ZG", name: "Inflation, consumer prices", unit: "%", digits: 2 },
  { id: "SL.UEM.TOTL.ZS", name: "Unemployment", unit: "% of labor force", digits: 2 },
  { id: "BN.CAB.XOKA.GD.ZS", name: "Current account balance", unit: "% of GDP", digits: 2 },
  { id: "NE.EXP.GNFS.ZS", name: "Exports of goods and services", unit: "% of GDP", digits: 2 },
  { id: "NE.IMP.GNFS.ZS", name: "Imports of goods and services", unit: "% of GDP", digits: 2 },
  { id: "BX.KLT.DINV.WD.GD.ZS", name: "FDI, net inflows", unit: "% of GDP", digits: 2 },
  { id: "FM.LBL.BMNY.GD.ZS", name: "Broad money", unit: "% of GDP", digits: 2 },
  { id: "CM.MKT.LCAP.GD.ZS", name: "Stock market capitalization", unit: "% of GDP", digits: 2 },
  { id: "GC.DOD.TOTL.GD.ZS", name: "Central government debt", unit: "% of GDP", digits: 2 },
  { id: "GC.BAL.CASH.GD.ZS", name: "Cash surplus or deficit", unit: "% of GDP", digits: 2 },
  { id: "FR.INR.RINR", name: "Real interest rate", unit: "%", digits: 2 },
  { id: "NY.GDP.PCAP.CD", name: "GDP per capita", unit: "current US$", digits: 0 },
  { id: "PA.NUS.FCRF", name: "Official exchange rate", unit: "local currency per USD", digits: 2 },
];
