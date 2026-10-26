import { alignedCloses, mean, rsi, sma, stdevSample } from "./math";
import type { Bar } from "./types";

export type RegionId = "us" | "emea" | "apac";

export type CountryId =
  | "us"
  | "ca"
  | "gb"
  | "de"
  | "fr"
  | "nl"
  | "ch"
  | "it"
  | "se"
  | "be"
  | "za"
  | "sa"
  | "jp"
  | "au"
  | "hk"
  | "cn"
  | "in"
  | "kr"
  | "sg"
  | "tw";

export type ScreenName = {
  symbol: string;
  name: string;
  bench: string;
  vs: string;
};

type RawName = { symbol: string; name: string; flagship?: boolean };

export type ScreenCountry = {
  id: CountryId;
  label: string;
  region: RegionId | "americas";
  bench: string;
  vs: string;
  news: string;
  names: RawName[];
};

function listed(flagships: [string, string][], extra: [string, string][] = []): RawName[] {
  return [
    ...flagships.map(([symbol, name]) => ({ symbol, name, flagship: true })),
    ...extra.map(([symbol, name]) => ({ symbol, name })),
  ];
}

export const COUNTRIES: ScreenCountry[] = [
  {
    id: "us",
    label: "United States",
    region: "us",
    bench: "^GSPC",
    vs: "the S&P 500",
    news: "^GSPC",
    names: listed([
      ["AAPL", "Apple"],
      ["MSFT", "Microsoft"],
      ["NVDA", "NVIDIA"],
      ["AMZN", "Amazon"],
      ["GOOGL", "Alphabet"],
      ["META", "Meta"],
      ["AVGO", "Broadcom"],
      ["JPM", "JPMorgan"],
      ["V", "Visa"],
      ["MA", "Mastercard"],
      ["BAC", "Bank of America"],
      ["UNH", "UnitedHealth"],
      ["JNJ", "Johnson & Johnson"],
      ["LLY", "Eli Lilly"],
      ["XOM", "Exxon Mobil"],
      ["CVX", "Chevron"],
      ["HD", "Home Depot"],
      ["COST", "Costco"],
      ["WMT", "Walmart"],
      ["PG", "Procter & Gamble"],
      ["KO", "Coca-Cola"],
      ["DIS", "Disney"],
      ["NFLX", "Netflix"],
      ["TSLA", "Tesla"],
      ["BRK-B", "Berkshire Hathaway"],
      ["ORCL", "Oracle"],
      ["CRM", "Salesforce"],
      ["AMD", "AMD"],
      ["ADBE", "Adobe"],
      ["CSCO", "Cisco"],
      ["PEP", "PepsiCo"],
      ["ABT", "Abbott"],
      ["MRK", "Merck"],
      ["TMO", "Thermo Fisher"],
      ["ABBV", "AbbVie"],
      ["PFE", "Pfizer"],
      ["MCD", "McDonald's"],
      ["NKE", "Nike"],
      ["SBUX", "Starbucks"],
      ["BA", "Boeing"],
      ["CAT", "Caterpillar"],
      ["GE", "GE Aerospace"],
      ["IBM", "IBM"],
      ["GS", "Goldman Sachs"],
      ["MS", "Morgan Stanley"],
      ["AXP", "American Express"],
      ["BLK", "BlackRock"],
      ["SPGI", "S&P Global"],
      ["INTU", "Intuit"],
      ["QCOM", "Qualcomm"],
    ]),
  },
  {
    id: "ca",
    label: "Canada",
    region: "americas",
    bench: "^GSPTSE",
    vs: "the TSX",
    news: "^GSPTSE",
    names: listed([
      ["RY.TO", "Royal Bank"],
      ["TD.TO", "TD"],
      ["SHOP.TO", "Shopify"],
      ["ENB.TO", "Enbridge"],
    ]),
  },
  {
    id: "gb",
    label: "United Kingdom",
    region: "emea",
    bench: "^FTSE",
    vs: "the FTSE 100",
    news: "^FTSE",
    names: listed(
      [
        ["HSBA.L", "HSBC"],
        ["SHEL.L", "Shell"],
        ["AZN.L", "AstraZeneca"],
        ["ULVR.L", "Unilever"],
      ],
      [
        ["BP.L", "BP"],
        ["GSK.L", "GSK"],
        ["DGE.L", "Diageo"],
        ["RIO.L", "Rio Tinto"],
      ],
    ),
  },
  {
    id: "de",
    label: "Germany",
    region: "emea",
    bench: "^GDAXI",
    vs: "the DAX",
    news: "^GDAXI",
    names: listed(
      [
        ["SAP.DE", "SAP"],
        ["SIE.DE", "Siemens"],
        ["ALV.DE", "Allianz"],
      ],
      [
        ["DTE.DE", "Deutsche Telekom"],
        ["BMW.DE", "BMW"],
        ["MBG.DE", "Mercedes-Benz"],
      ],
    ),
  },
  {
    id: "fr",
    label: "France",
    region: "emea",
    bench: "^FCHI",
    vs: "the CAC 40",
    news: "^FCHI",
    names: listed(
      [
        ["MC.PA", "LVMH"],
        ["OR.PA", "L'Oréal"],
        ["TTE.PA", "TotalEnergies"],
      ],
      [
        ["AIR.PA", "Airbus"],
        ["SAN.PA", "Sanofi"],
      ],
    ),
  },
  {
    id: "nl",
    label: "Netherlands",
    region: "emea",
    bench: "^AEX",
    vs: "the AEX",
    news: "^AEX",
    names: listed(
      [["ASML.AS", "ASML"]],
      [
        ["PHIA.AS", "Philips"],
        ["INGA.AS", "ING"],
        ["HEIA.AS", "Heineken"],
      ],
    ),
  },
  {
    id: "ch",
    label: "Switzerland",
    region: "emea",
    bench: "^SSMI",
    vs: "the SMI",
    news: "^SSMI",
    names: listed(
      [
        ["NESN.SW", "Nestlé"],
        ["NOVN.SW", "Novartis"],
      ],
      [
        ["RO.SW", "Roche"],
        ["UBSG.SW", "UBS"],
      ],
    ),
  },
  {
    id: "it",
    label: "Italy",
    region: "emea",
    bench: "FTSEMIB.MI",
    vs: "the FTSE MIB",
    news: "FTSEMIB.MI",
    names: listed(
      [
        ["ENI.MI", "ENI"],
        ["ENEL.MI", "Enel"],
      ],
      [
        ["ISP.MI", "Intesa Sanpaolo"],
        ["RACE.MI", "Ferrari"],
      ],
    ),
  },
  {
    id: "se",
    label: "Sweden",
    region: "emea",
    bench: "^OMXS30",
    vs: "the OMX 30",
    news: "^OMXS30",
    names: listed(
      [["VOLV-B.ST", "Volvo"]],
      [
        ["ERIC-B.ST", "Ericsson"],
        ["HM-B.ST", "H&M"],
      ],
    ),
  },
  {
    id: "be",
    label: "Belgium",
    region: "emea",
    bench: "^BFX",
    vs: "the BEL 20",
    news: "^BFX",
    names: listed([["ABI.BR", "AB InBev"]], [["KBC.BR", "KBC"]]),
  },
  {
    id: "za",
    label: "South Africa",
    region: "emea",
    bench: "^J200.JO",
    vs: "the JSE Top 40",
    news: "^J200.JO",
    names: listed(
      [["NPN.JO", "Naspers"]],
      [["SBK.JO", "Standard Bank"]],
    ),
  },
  {
    id: "sa",
    label: "Saudi Arabia",
    region: "emea",
    bench: "^TASI.SR",
    vs: "the Tadawul",
    news: "^TASI.SR",
    names: listed(
      [["2222.SR", "Saudi Aramco"]],
      [["1120.SR", "Al Rajhi"]],
    ),
  },
  {
    id: "jp",
    label: "Japan",
    region: "apac",
    bench: "^N225",
    vs: "the Nikkei 225",
    news: "^N225",
    names: listed(
      [
        ["7203.T", "Toyota"],
        ["6758.T", "Sony"],
        ["9984.T", "SoftBank"],
      ],
      [
        ["8306.T", "Mitsubishi UFJ"],
        ["8035.T", "Tokyo Electron"],
      ],
    ),
  },
  {
    id: "au",
    label: "Australia",
    region: "apac",
    bench: "^AXJO",
    vs: "the ASX 200",
    news: "^AXJO",
    names: listed(
      [
        ["BHP.AX", "BHP"],
        ["CBA.AX", "Commonwealth Bank"],
      ],
      [["CSL.AX", "CSL"]],
    ),
  },
  {
    id: "hk",
    label: "Hong Kong",
    region: "apac",
    bench: "^HSI",
    vs: "the Hang Seng",
    news: "^HSI",
    names: listed(
      [
        ["0700.HK", "Tencent"],
        ["0005.HK", "HSBC HK"],
        ["9988.HK", "Alibaba"],
        ["3690.HK", "Meituan"],
      ],
      [["0941.HK", "China Mobile"]],
    ),
  },
  {
    id: "cn",
    label: "China",
    region: "apac",
    bench: "000001.SS",
    vs: "the Shanghai composite",
    news: "000001.SS",
    names: listed([["600519.SS", "Kweichow Moutai"]], [["601318.SS", "Ping An"]]),
  },
  {
    id: "in",
    label: "India",
    region: "apac",
    bench: "^NSEI",
    vs: "the Nifty 50",
    news: "^NSEI",
    names: listed(
      [
        ["RELIANCE.NS", "Reliance"],
        ["TCS.NS", "TCS"],
        ["HDFCBANK.NS", "HDFC Bank"],
        ["INFY.NS", "Infosys"],
      ],
      [["ICICIBANK.NS", "ICICI Bank"],
      ["BHARTIARTL.NS", "Bharti Airtel"],
      ["SBIN.NS", "SBI"],
      ["LT.NS", "Larsen & Toubro"],
      ["ITC.NS", "ITC"],
      ["HINDUNILVR.NS", "Hindustan Unilever"],
      ["BAJFINANCE.NS", "Bajaj Finance"],
      ["HCLTECH.NS", "HCL Tech"],
      ["MARUTI.NS", "Maruti Suzuki"],
      ["SUNPHARMA.NS", "Sun Pharma"],
      ["KOTAKBANK.NS", "Kotak Mahindra"],
      ["AXISBANK.NS", "Axis Bank"],
      ["TITAN.NS", "Titan"],
      ["ULTRACEMCO.NS", "UltraTech"],
      ["NTPC.NS", "NTPC"],
      ["ONGC.NS", "ONGC"],
      ["POWERGRID.NS", "Power Grid"],
      ["TMPV.NS", "Tata Motors"],
      ["TATASTEEL.NS", "Tata Steel"],
      ["ADANIENT.NS", "Adani Enterprises"],
      ["ADANIPORTS.NS", "Adani Ports"],
      ["WIPRO.NS", "Wipro"],
      ["TECHM.NS", "Tech Mahindra"],
      ["NESTLEIND.NS", "Nestle India"],
      ["ASIANPAINT.NS", "Asian Paints"],
      ["BAJAJFINSV.NS", "Bajaj Finserv"],
      ["GRASIM.NS", "Grasim"],
      ["JSWSTEEL.NS", "JSW Steel"],
      ["HINDALCO.NS", "Hindalco"],
      ["COALINDIA.NS", "Coal India"],
      ["BPCL.NS", "BPCL"],
      ["BRITANNIA.NS", "Britannia"],
      ["CIPLA.NS", "Cipla"],
      ["DRREDDY.NS", "Dr Reddy's"],
      ["EICHERMOT.NS", "Eicher Motors"],
      ["HEROMOTOCO.NS", "Hero MotoCorp"],
      ["DIVISLAB.NS", "Divi's Labs"],
      ["APOLLOHOSP.NS", "Apollo Hospitals"],
      ["SBILIFE.NS", "SBI Life"],
      ["HDFCLIFE.NS", "HDFC Life"],
      ["INDUSINDBK.NS", "IndusInd Bank"],
      ["TRENT.NS", "Trent"],
      ["BEL.NS", "Bharat Electronics"],
      ["SHRIRAMFIN.NS", "Shriram Finance"],
      ["BAJAJ-AUTO.NS", "Bajaj Auto"],
      ["DMART.NS", "DMart"],
      ["TATACONSUM.NS", "Tata Consumer"]],
    ),
  },
  {
    id: "kr",
    label: "Korea",
    region: "apac",
    bench: "^KS11",
    vs: "the KOSPI",
    news: "^KS11",
    names: listed(
      [
        ["005930.KS", "Samsung"],
        ["000660.KS", "SK hynix"],
      ],
      [["005380.KS", "Hyundai Motor"]],
    ),
  },
  {
    id: "sg",
    label: "Singapore",
    region: "apac",
    bench: "^STI",
    vs: "the Straits Times",
    news: "^STI",
    names: listed([["D05.SI", "DBS"]], [["O39.SI", "OCBC"]]),
  },
  {
    id: "tw",
    label: "Taiwan",
    region: "apac",
    bench: "^TWII",
    vs: "the Taiwan weighted",
    news: "^TWII",
    names: listed(
      [
        ["2330.TW", "TSMC"],
        ["2317.TW", "Hon Hai"],
      ],
      [["2454.TW", "MediaTek"]],
    ),
  },
];

export const REGIONS: { id: RegionId; label: string; note: string }[] = [
  { id: "us", label: "US", note: "Beta is versus the S&P 500." },
  {
    id: "emea",
    label: "EMEA",
    note: "United Kingdom, euro area, Switzerland, Sweden, Belgium, South Africa, and Saudi Arabia. Beta is versus each home index, in local currency. Saudi beta stays blank: the Tadawul history feed is one print.",
  },
  {
    id: "apac",
    label: "APAC",
    note: "Japan, Australia, Hong Kong, China, India, Korea, Singapore, and Taiwan. Beta is versus each home index, in local currency.",
  },
];

export const COUNTRY_OPTIONS: { id: CountryId; label: string }[] = COUNTRIES.map((row) => ({ id: row.id, label: row.label }));

function asScreen(country: ScreenCountry, onlyFlagship: boolean): ScreenName[] {
  const rows = onlyFlagship ? country.names.filter((row) => row.flagship) : country.names;
  return rows.map((row) => ({ symbol: row.symbol, name: row.name, bench: country.bench, vs: country.vs }));
}

export function regionNames(region: RegionId): ScreenName[] {
  return COUNTRIES.filter((row) => row.region === region).flatMap((row) => asScreen(row, region !== "us"));
}

export function countryNames(id: CountryId): ScreenName[] {
  const country = COUNTRIES.find((row) => row.id === id);
  return country ? asScreen(country, false) : [];
}

export function countryMeta(id: CountryId): { label: string; news: string; vs: string } {
  const country = COUNTRIES.find((row) => row.id === id) ?? COUNTRIES[0];
  return { label: country.label, news: country.news, vs: country.vs };
}

export function regionNews(region: RegionId): string {
  if (region === "emea") return "^STOXX50E";
  if (region === "apac") return "^N225";
  return "^GSPC";
}

export const BENCHMARK = "^GSPC";

export const SCREENER: { symbol: string; name: string }[] = countryNames("us").map(({ symbol, name }) => ({ symbol, name }));

export function screenerChunks(names: ScreenName[]): string[][] {
  const symbols = [...new Set([...names.map((row) => row.symbol), ...names.map((row) => row.bench)])];
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += 8) chunks.push(symbols.slice(i, i + 8));
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) {
    const last = chunks.pop();
    const prev = chunks[chunks.length - 1];
    if (last && prev?.length) {
      const moved = prev.pop();
      if (moved) last.unshift(moved);
      chunks.push(last);
    }
  }
  return chunks;
}

export function screenName(symbol: string): string | undefined {
  for (const country of COUNTRIES) {
    const hit = country.names.find((row) => row.symbol === symbol);
    if (hit) return hit.name;
  }
  return undefined;
}

export function homeBench(symbol: string): { symbol: string; vs: string } {
  for (const country of COUNTRIES) {
    const hit = country.names.find((row) => row.symbol === symbol);
    if (hit) return { symbol: country.bench, vs: country.vs };
  }
  return { symbol: BENCHMARK, vs: "the S&P 500" };
}

export type ScreenStats = {
  symbol: string;
  name: string;
  ret5: number | null;
  ret21: number | null;
  ret63: number | null;
  ret252: number | null;
  mom: number | null;
  rsi: number | null;
  z: number | null;
  above50: boolean;
  below200: boolean;
  distHigh20: number | null;
  range52: number | null;
  offHigh: number | null;
  rv21: number | null;
  volPct: number | null;
  beta: number | null;
  idio: number | null;
};

function trail(closes: number[], n: number): number | null {
  if (closes.length <= n) return null;
  const prev = closes[closes.length - 1 - n];
  const last = closes[closes.length - 1];
  if (!(prev > 0 && last > 0)) return null;
  return last / prev - 1;
}

function realized(closes: number[], n: number): number | null {
  if (closes.length < n + 1) return null;
  const rets: number[] = [];
  for (let i = closes.length - n; i < closes.length; i++) {
    const prev = closes[i - 1];
    const next = closes[i];
    if (!(prev > 0 && next > 0)) return null;
    rets.push(Math.log(next / prev));
  }
  const sd = stdevSample(rets);
  return sd > 0 ? sd * Math.sqrt(252) : null;
}

export function volRank(closes: number[], n = 21): number | null {
  if (closes.length < n + 40) return null;
  const vols: number[] = [];
  for (let i = n; i < closes.length; i++) {
    const vol = realized(closes.slice(0, i + 1), n);
    if (vol != null) vols.push(vol);
  }
  if (vols.length < 40) return null;
  const last = vols[vols.length - 1];
  return (vols.filter((vol) => vol <= last).length / vols.length) * 100;
}

function pairReturns(stock: { d: string; c: number }[], bench: { d: string; c: number }[]) {
  const aligned = alignedCloses([
    { symbol: "y", bars: stock },
    { symbol: "x", bars: bench },
  ]);
  if (!aligned) return null;
  const y: number[] = [];
  const x: number[] = [];
  const dates: string[] = [];
  for (let i = 1; i < aligned.dates.length; i++) {
    const y0 = aligned.closes[0][i - 1];
    const y1 = aligned.closes[0][i];
    const x0 = aligned.closes[1][i - 1];
    const x1 = aligned.closes[1][i];
    if (!(y0 > 0 && y1 > 0 && x0 > 0 && x1 > 0)) continue;
    y.push(y1 / y0 - 1);
    x.push(x1 / x0 - 1);
    dates.push(aligned.dates[i]);
  }
  if (y.length < 60) return null;
  return { dates, y, x };
}

function fit(y: number[], x: number[]): { beta: number; idio: number } | null {
  if (y.length < 40 || y.length !== x.length) return null;
  const mx = mean(x);
  const my = mean(y);
  let varx = 0;
  let cov = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    varx += dx * dx;
    cov += dx * (y[i] - my);
  }
  if (!(varx > 0)) return null;
  const beta = cov / varx;
  const resid: number[] = [];
  for (let i = 0; i < y.length; i++) resid.push(y[i] - my - beta * (x[i] - mx));
  const idio = stdevSample(resid) * Math.sqrt(252);
  return { beta, idio };
}

export function screenStats(symbol: string, name: string, bars: Bar[], bench: Bar[]): ScreenStats | null {
  const closes = bars.map((bar) => bar.c).filter((price) => price > 0);
  if (closes.length !== bars.length || closes.length < 80) return null;
  const last = closes.length - 1;
  const fast = sma(closes, 50);
  const slow = sma(closes, 200);
  const rsiLine = rsi(closes, 14);
  let hi = -Infinity;
  let lo = Infinity;
  const from = Math.max(0, bars.length - 252);
  for (let i = from; i < bars.length; i++) {
    if (bars[i].h > hi) hi = bars[i].h;
    if (bars[i].l < lo) lo = bars[i].l;
  }
  const span = hi - lo;
  const close = bars[last].c;
  let priorHi = -Infinity;
  if (last >= 20) {
    for (let k = last - 20; k < last; k++) if (bars[k].h > priorHi) priorHi = bars[k].h;
  }
  const slice = closes.slice(last - 59, last + 1);
  const sd = slice.length >= 60 ? stdevSample(slice) : 0;
  const z = sd > 0 ? (closes[last] - mean(slice)) / sd : null;
  const mom = closes.length > 252 ? trail(closes.slice(0, closes.length - 21), 231) : null;
  const paired = pairReturns(bars, bench);
  const sample = paired ? fit(paired.y.slice(-252), paired.x.slice(-252)) : null;
  const sma50 = fast[last];
  const sma200 = slow[last];
  return {
    symbol,
    name,
    ret5: trail(closes, 5),
    ret21: trail(closes, 21),
    ret63: trail(closes, 63),
    ret252: trail(closes, 252),
    mom,
    rsi: rsiLine[last] ?? null,
    z,
    above50: sma50 != null && close > sma50,
    below200: sma200 != null && close < sma200,
    distHigh20: priorHi > 0 ? close / priorHi - 1 : null,
    range52: span > 0 ? (close - lo) / span : null,
    offHigh: hi > 0 ? (hi - close) / hi : null,
    rv21: realized(closes, 21),
    volPct: volRank(closes, 21),
    beta: sample?.beta ?? null,
    idio: sample?.idio ?? null,
  };
}

export function rollingBeta(stock: Bar[], bench: Bar[], window = 63): { d: string; beta: number }[] {
  const paired = pairReturns(stock, bench);
  if (!paired || paired.y.length < window) return [];
  const out: { d: string; beta: number }[] = [];
  for (let i = window; i <= paired.y.length; i++) {
    const fitRow = fit(paired.y.slice(i - window, i), paired.x.slice(i - window, i));
    if (fitRow) out.push({ d: paired.dates[i - 1], beta: fitRow.beta });
  }
  return out;
}

export function searchSymbol(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const symbol = value.trim().toUpperCase();
  if (!/^[A-Z0-9.^=-]{1,18}$/.test(symbol)) return undefined;
  return symbol;
}

export function factorShare(values: (number | null)[][]): number | null {
  const n = values.length;
  if (n < 2) return null;
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) row.push(1);
      else {
        const value = values[i]?.[j];
        if (value == null || !Number.isFinite(value)) return null;
        row.push(value);
      }
    }
    matrix.push(row);
  }
  let vec = Array.from({ length: n }, () => 1 / Math.sqrt(n));
  let eigenvalue = 0;
  for (let k = 0; k < 48; k++) {
    const next = vec.map((_, i) => matrix[i].reduce((sum, value, j) => sum + value * vec[j], 0));
    eigenvalue = next.reduce((sum, value, i) => sum + value * vec[i], 0);
    const norm = Math.hypot(...next);
    if (!(norm > 0)) return null;
    vec = next.map((value) => value / norm);
  }
  if (!(eigenvalue > 0)) return null;
  return Math.min(1, eigenvalue / n);
}

