import { SCREENER } from "./screen";

export type Listing = {
  symbol: string;
  name: string;
  kind: "index" | "stock" | "etf" | "yield" | "future" | "fund" | "fx" | "metal" | "energy";
  digits?: number;
};

export type EquityMarketId =
  | "global"
  | "us"
  | "gb"
  | "jp"
  | "de"
  | "fr"
  | "it"
  | "ca"
  | "ch"
  | "se"
  | "nl"
  | "be"
  | "au"
  | "cn"
  | "hk"
  | "in"
  | "kr"
  | "sg"
  | "tw"
  | "za"
  | "sa";

export type RatesMarketId =
  | "global"
  | "us"
  | "gb"
  | "de"
  | "eu"
  | "jp"
  | "ca"
  | "au"
  | "in";

export type FxPair = Listing & {
  group: "g10" | "asia" | "cross";
  ecb?: "invert" | "direct";
  ecbCode?: string;
};

export const EQUITY_MARKETS: { id: EquityMarketId; label: string }[] = [
  {
    "id": "global",
    "label": "Global"
  },
  {
    "id": "us",
    "label": "United States"
  },
  {
    "id": "gb",
    "label": "United Kingdom"
  },
  {
    "id": "jp",
    "label": "Japan"
  },
  {
    "id": "de",
    "label": "Germany"
  },
  {
    "id": "fr",
    "label": "France"
  },
  {
    "id": "it",
    "label": "Italy"
  },
  {
    "id": "ca",
    "label": "Canada"
  },
  {
    "id": "ch",
    "label": "Switzerland"
  },
  {
    "id": "se",
    "label": "Sweden"
  },
  {
    "id": "nl",
    "label": "Netherlands"
  },
  {
    "id": "be",
    "label": "Belgium"
  },
  {
    "id": "au",
    "label": "Australia"
  },
  {
    "id": "cn",
    "label": "China"
  },
  {
    "id": "hk",
    "label": "Hong Kong"
  },
  {
    "id": "in",
    "label": "India"
  },
  {
    "id": "kr",
    "label": "Korea"
  },
  {
    "id": "sg",
    "label": "Singapore"
  },
  {
    "id": "tw",
    "label": "Taiwan"
  },
  {
    "id": "za",
    "label": "South Africa"
  },
  {
    "id": "sa",
    "label": "Saudi Arabia"
  }
];

export const EQUITY_BOOKS: Record<EquityMarketId, { stock: Listing[]; etf: Listing[] }> = {
  "global": {
    "stock": [
      {
        "symbol": "^GSPC",
        "name": "S&P 500",
        "kind": "index"
      },
      {
        "symbol": "^DJI",
        "name": "Dow Jones",
        "kind": "index"
      },
      {
        "symbol": "^IXIC",
        "name": "Nasdaq",
        "kind": "index"
      },
      {
        "symbol": "^FTSE",
        "name": "FTSE 100",
        "kind": "index"
      },
      {
        "symbol": "^GDAXI",
        "name": "DAX",
        "kind": "index"
      },
      {
        "symbol": "^FCHI",
        "name": "CAC 40",
        "kind": "index"
      },
      {
        "symbol": "^STOXX50E",
        "name": "Euro Stoxx 50",
        "kind": "index"
      },
      {
        "symbol": "^N225",
        "name": "Nikkei 225",
        "kind": "index"
      },
      {
        "symbol": "^HSI",
        "name": "Hang Seng",
        "kind": "index"
      },
      {
        "symbol": "000001.SS",
        "name": "SSE Composite",
        "kind": "index"
      },
      {
        "symbol": "^NSEI",
        "name": "Nifty 50",
        "kind": "index"
      },
      {
        "symbol": "^KS11",
        "name": "KOSPI",
        "kind": "index"
      },
      {
        "symbol": "^AXJO",
        "name": "ASX 200",
        "kind": "index"
      },
      {
        "symbol": "^TWII",
        "name": "Taiwan weighted",
        "kind": "index"
      },
      {
        "symbol": "^STI",
        "name": "Straits Times",
        "kind": "index"
      },
      {
        "symbol": "^GSPTSE",
        "name": "TSX",
        "kind": "index"
      },
      {
        "symbol": "^SSMI",
        "name": "SMI",
        "kind": "index"
      },
      {
        "symbol": "^OMXS30",
        "name": "OMX 30",
        "kind": "index"
      },
      {
        "symbol": "^AEX",
        "name": "AEX",
        "kind": "index"
      },
      {
        "symbol": "^BFX",
        "name": "BEL 20",
        "kind": "index"
      }
    ],
    "etf": [
      {
        "symbol": "SPY",
        "name": "SPDR S&P 500",
        "kind": "etf"
      },
      {
        "symbol": "QQQ",
        "name": "Invesco QQQ",
        "kind": "etf"
      },
      {
        "symbol": "EFA",
        "name": "iShares EAFE",
        "kind": "etf"
      },
      {
        "symbol": "VEA",
        "name": "Vanguard developed",
        "kind": "etf"
      },
      {
        "symbol": "VWO",
        "name": "Vanguard emerging",
        "kind": "etf"
      },
      {
        "symbol": "EWJ",
        "name": "iShares Japan",
        "kind": "etf"
      },
      {
        "symbol": "FXI",
        "name": "iShares China large cap",
        "kind": "etf"
      },
      {
        "symbol": "INDA",
        "name": "iShares India",
        "kind": "etf"
      },
      {
        "symbol": "EWA",
        "name": "iShares Australia",
        "kind": "etf"
      }
    ]
  },
  "us": {
    "stock": [
      {
        "symbol": "^GSPC",
        "name": "S&P 500",
        "kind": "index"
      },
      {
        "symbol": "^DJI",
        "name": "Dow Jones",
        "kind": "index"
      },
      {
        "symbol": "^IXIC",
        "name": "Nasdaq",
        "kind": "index"
      },
      {
        "symbol": "AAPL",
        "name": "Apple",
        "kind": "stock"
      },
      {
        "symbol": "MSFT",
        "name": "Microsoft",
        "kind": "stock"
      },
      {
        "symbol": "NVDA",
        "name": "NVIDIA",
        "kind": "stock"
      },
      {
        "symbol": "AMZN",
        "name": "Amazon",
        "kind": "stock"
      },
      {
        "symbol": "GOOGL",
        "name": "Alphabet",
        "kind": "stock"
      },
      {
        "symbol": "META",
        "name": "Meta",
        "kind": "stock"
      },
      {
        "symbol": "AVGO",
        "name": "Broadcom",
        "kind": "stock"
      },
      {
        "symbol": "JPM",
        "name": "JPMorgan",
        "kind": "stock"
      },
      {
        "symbol": "V",
        "name": "Visa",
        "kind": "stock"
      },
      {
        "symbol": "MA",
        "name": "Mastercard",
        "kind": "stock"
      },
      {
        "symbol": "BAC",
        "name": "Bank of America",
        "kind": "stock"
      },
      {
        "symbol": "UNH",
        "name": "UnitedHealth",
        "kind": "stock"
      },
      {
        "symbol": "JNJ",
        "name": "Johnson & Johnson",
        "kind": "stock"
      },
      {
        "symbol": "LLY",
        "name": "Eli Lilly",
        "kind": "stock"
      },
      {
        "symbol": "XOM",
        "name": "Exxon Mobil",
        "kind": "stock"
      },
      {
        "symbol": "CVX",
        "name": "Chevron",
        "kind": "stock"
      },
      {
        "symbol": "HD",
        "name": "Home Depot",
        "kind": "stock"
      },
      {
        "symbol": "COST",
        "name": "Costco",
        "kind": "stock"
      },
      {
        "symbol": "WMT",
        "name": "Walmart",
        "kind": "stock"
      },
      {
        "symbol": "PG",
        "name": "Procter & Gamble",
        "kind": "stock"
      },
      {
        "symbol": "KO",
        "name": "Coca-Cola",
        "kind": "stock"
      },
      {
        "symbol": "DIS",
        "name": "Disney",
        "kind": "stock"
      },
      {
        "symbol": "NFLX",
        "name": "Netflix",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "SPY",
        "name": "SPDR S&P 500",
        "kind": "etf"
      },
      {
        "symbol": "QQQ",
        "name": "Invesco QQQ",
        "kind": "etf"
      },
      {
        "symbol": "IWM",
        "name": "iShares Russell 2000",
        "kind": "etf"
      }
    ]
  },
  "gb": {
    "stock": [
      {
        "symbol": "^FTSE",
        "name": "FTSE 100",
        "kind": "index"
      },
      {
        "symbol": "HSBA.L",
        "name": "HSBC",
        "kind": "stock"
      },
      {
        "symbol": "SHEL.L",
        "name": "Shell",
        "kind": "stock"
      },
      {
        "symbol": "AZN.L",
        "name": "AstraZeneca",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWU",
        "name": "iShares MSCI UK",
        "kind": "etf"
      }
    ]
  },
  "jp": {
    "stock": [
      {
        "symbol": "^N225",
        "name": "Nikkei 225",
        "kind": "index"
      },
      {
        "symbol": "7203.T",
        "name": "Toyota",
        "kind": "stock"
      },
      {
        "symbol": "6758.T",
        "name": "Sony",
        "kind": "stock"
      },
      {
        "symbol": "9984.T",
        "name": "SoftBank",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWJ",
        "name": "iShares MSCI Japan",
        "kind": "etf"
      }
    ]
  },
  "de": {
    "stock": [
      {
        "symbol": "^GDAXI",
        "name": "DAX",
        "kind": "index"
      },
      {
        "symbol": "SAP.DE",
        "name": "SAP",
        "kind": "stock"
      },
      {
        "symbol": "SIE.DE",
        "name": "Siemens",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWG",
        "name": "iShares MSCI Germany",
        "kind": "etf"
      }
    ]
  },
  "fr": {
    "stock": [
      {
        "symbol": "^FCHI",
        "name": "CAC 40",
        "kind": "index"
      },
      {
        "symbol": "MC.PA",
        "name": "LVMH",
        "kind": "stock"
      },
      {
        "symbol": "OR.PA",
        "name": "L'Oréal",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWQ",
        "name": "iShares MSCI France",
        "kind": "etf"
      }
    ]
  },
  "it": {
    "stock": [
      {
        "symbol": "ENI.MI",
        "name": "ENI",
        "kind": "stock"
      },
      {
        "symbol": "ENEL.MI",
        "name": "Enel",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWI",
        "name": "iShares MSCI Italy",
        "kind": "etf"
      }
    ]
  },
  "ca": {
    "stock": [
      {
        "symbol": "^GSPTSE",
        "name": "TSX",
        "kind": "index"
      },
      {
        "symbol": "RY.TO",
        "name": "Royal Bank of Canada",
        "kind": "stock"
      },
      {
        "symbol": "TD.TO",
        "name": "TD Bank",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWC",
        "name": "iShares MSCI Canada",
        "kind": "etf"
      }
    ]
  },
  "ch": {
    "stock": [
      {
        "symbol": "^SSMI",
        "name": "SMI",
        "kind": "index"
      },
      {
        "symbol": "NESN.SW",
        "name": "Nestlé",
        "kind": "stock"
      },
      {
        "symbol": "NOVN.SW",
        "name": "Novartis",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWL",
        "name": "iShares MSCI Switzerland",
        "kind": "etf"
      }
    ]
  },
  "se": {
    "stock": [
      {
        "symbol": "^OMXS30",
        "name": "OMX 30",
        "kind": "index"
      },
      {
        "symbol": "VOLV-B.ST",
        "name": "Volvo B",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWD",
        "name": "iShares MSCI Sweden",
        "kind": "etf"
      }
    ]
  },
  "nl": {
    "stock": [
      {
        "symbol": "^AEX",
        "name": "AEX",
        "kind": "index"
      },
      {
        "symbol": "ASML.AS",
        "name": "ASML",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWN",
        "name": "iShares MSCI Netherlands",
        "kind": "etf"
      }
    ]
  },
  "be": {
    "stock": [
      {
        "symbol": "^BFX",
        "name": "BEL 20",
        "kind": "index"
      },
      {
        "symbol": "ABI.BR",
        "name": "AB InBev",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWK",
        "name": "iShares MSCI Belgium",
        "kind": "etf"
      }
    ]
  },
  "au": {
    "stock": [
      {
        "symbol": "^AXJO",
        "name": "ASX 200",
        "kind": "index"
      },
      {
        "symbol": "BHP.AX",
        "name": "BHP",
        "kind": "stock"
      },
      {
        "symbol": "CBA.AX",
        "name": "Commonwealth Bank",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWA",
        "name": "iShares MSCI Australia",
        "kind": "etf"
      }
    ]
  },
  "cn": {
    "stock": [
      {
        "symbol": "000001.SS",
        "name": "SSE Composite",
        "kind": "index"
      },
      {
        "symbol": "600519.SS",
        "name": "Kweichow Moutai",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "FXI",
        "name": "iShares China large cap",
        "kind": "etf"
      }
    ]
  },
  "hk": {
    "stock": [
      {
        "symbol": "^HSI",
        "name": "Hang Seng",
        "kind": "index"
      },
      {
        "symbol": "0700.HK",
        "name": "Tencent",
        "kind": "stock"
      },
      {
        "symbol": "0005.HK",
        "name": "HSBC",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWH",
        "name": "iShares MSCI Hong Kong",
        "kind": "etf"
      }
    ]
  },
  "in": {
    "stock": [
      {
        "symbol": "^NSEI",
        "name": "Nifty 50",
        "kind": "index"
      },
      {
        "symbol": "^BSESN",
        "name": "Sensex",
        "kind": "index"
      },
      {
        "symbol": "RELIANCE.NS",
        "name": "Reliance",
        "kind": "stock"
      },
      {
        "symbol": "TCS.NS",
        "name": "TCS",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "INDA",
        "name": "iShares MSCI India",
        "kind": "etf"
      }
    ]
  },
  "kr": {
    "stock": [
      {
        "symbol": "^KS11",
        "name": "KOSPI",
        "kind": "index"
      },
      {
        "symbol": "005930.KS",
        "name": "Samsung Electronics",
        "kind": "stock"
      },
      {
        "symbol": "000660.KS",
        "name": "SK hynix",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWY",
        "name": "iShares MSCI Korea",
        "kind": "etf"
      }
    ]
  },
  "sg": {
    "stock": [
      {
        "symbol": "^STI",
        "name": "Straits Times",
        "kind": "index"
      },
      {
        "symbol": "D05.SI",
        "name": "DBS",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWS",
        "name": "iShares MSCI Singapore",
        "kind": "etf"
      }
    ]
  },
  "tw": {
    "stock": [
      {
        "symbol": "^TWII",
        "name": "Taiwan weighted",
        "kind": "index"
      },
      {
        "symbol": "2330.TW",
        "name": "TSMC",
        "kind": "stock"
      }
    ],
    "etf": [
      {
        "symbol": "EWT",
        "name": "iShares MSCI Taiwan",
        "kind": "etf"
      }
    ]
  },
  "za": {
    "stock": [
      {
        "symbol": "^J200.JO",
        "name": "JSE Top 40",
        "kind": "index"
      },
      {
        "symbol": "NPN.JO",
        "name": "Naspers",
        "kind": "stock"
      },
      {
        "symbol": "SBK.JO",
        "name": "Standard Bank",
        "kind": "stock"
      }
    ],
    "etf": []
  },
  "sa": {
    "stock": [
      {
        "symbol": "^TASI.SR",
        "name": "Tadawul",
        "kind": "index"
      },
      {
        "symbol": "2222.SR",
        "name": "Saudi Aramco",
        "kind": "stock"
      },
      {
        "symbol": "1120.SR",
        "name": "Al Rajhi",
        "kind": "stock"
      }
    ],
    "etf": []
  }
};

const OPTION_UNDERLYINGS: Listing[] = [
  {
    "symbol": "SPY",
    "name": "SPDR S&P 500",
    "kind": "etf"
  },
  {
    "symbol": "QQQ",
    "name": "Invesco QQQ",
    "kind": "etf"
  },
  {
    "symbol": "IWM",
    "name": "iShares Russell 2000",
    "kind": "etf"
  },
  {
    "symbol": "AAPL",
    "name": "Apple",
    "kind": "stock"
  },
  {
    "symbol": "MSFT",
    "name": "Microsoft",
    "kind": "stock"
  },
  {
    "symbol": "NVDA",
    "name": "NVIDIA",
    "kind": "stock"
  },
  {
    "symbol": "AMZN",
    "name": "Amazon",
    "kind": "stock"
  },
  {
    "symbol": "META",
    "name": "Meta",
    "kind": "stock"
  },
  {
    "symbol": "JPM",
    "name": "JPMorgan",
    "kind": "stock"
  },
  {
    "symbol": "GLD",
    "name": "SPDR Gold",
    "kind": "etf"
  },
  {
    "symbol": "TLT",
    "name": "20+y Treasury",
    "kind": "etf"
  },
  {
    "symbol": "HYG",
    "name": "High yield",
    "kind": "etf"
  }
];

export function optionBook(market: EquityMarketId): Listing[] {
  if (market === "global" || market === "us") return OPTION_UNDERLYINGS;
  return EQUITY_BOOKS[market].stock.filter((row) => row.kind !== "index");
}

export function equityBook(market: EquityMarketId, kind: "stock" | "etf"): Listing[] {
  const book = EQUITY_BOOKS[market];
  if (kind === "etf") return book.etf;
  return book.stock;
}

export function equitySearchScope(market: EquityMarketId): EquityMarketId | "equity" {
  return market === "global" ? "equity" : market;
}

export const SEARCH_EXCHANGES: Record<string, { codes: string[]; disp: string[] }> = {
  "us": {
    "codes": [
      "NMS",
      "NGM",
      "NCM",
      "NYQ",
      "PCX",
      "ASE",
      "BTS",
      "NYS",
      "NIM"
    ],
    "disp": [
      "nasdaq",
      "nyse",
      "nysearca",
      "nyseamerican",
      "bats",
      "amex"
    ]
  },
  "gb": {
    "codes": [
      "LSE"
    ],
    "disp": [
      "london"
    ]
  },
  "jp": {
    "codes": [
      "JPX",
      "OSA"
    ],
    "disp": [
      "tokyo",
      "osaka"
    ]
  },
  "de": {
    "codes": [
      "GER"
    ],
    "disp": [
      "xetra",
      "frankfurt"
    ]
  },
  "fr": {
    "codes": [
      "PAR"
    ],
    "disp": [
      "paris"
    ]
  },
  "it": {
    "codes": [
      "MIL"
    ],
    "disp": [
      "milan"
    ]
  },
  "ca": {
    "codes": [
      "TOR",
      "VAN"
    ],
    "disp": [
      "toronto",
      "tsx",
      "tsxv"
    ]
  },
  "ch": {
    "codes": [
      "EBS"
    ],
    "disp": [
      "swiss"
    ]
  },
  "se": {
    "codes": [
      "STO"
    ],
    "disp": [
      "stockholm"
    ]
  },
  "nl": {
    "codes": [
      "AMS"
    ],
    "disp": [
      "amsterdam"
    ]
  },
  "be": {
    "codes": [
      "BRU"
    ],
    "disp": [
      "brussels"
    ]
  },
  "au": {
    "codes": [
      "ASX"
    ],
    "disp": [
      "asx"
    ]
  },
  "cn": {
    "codes": [
      "SHH",
      "SHZ"
    ],
    "disp": [
      "shanghai",
      "shenzhen"
    ]
  },
  "hk": {
    "codes": [
      "HKG"
    ],
    "disp": [
      "hkse",
      "hongkong"
    ]
  },
  "in": {
    "codes": [
      "NSI",
      "BOM",
      "BSE"
    ],
    "disp": [
      "nse",
      "bse"
    ]
  },
  "kr": {
    "codes": [
      "KSC",
      "KOE"
    ],
    "disp": [
      "korea",
      "kosdaq"
    ]
  },
  "sg": {
    "codes": [
      "SES"
    ],
    "disp": [
      "singapore"
    ]
  },
  "tw": {
    "codes": [
      "TAI",
      "TWO"
    ],
    "disp": [
      "taiwan"
    ]
  }
};

export const RATES_MARKETS: { id: RatesMarketId; label: string }[] = [
  {
    "id": "global",
    "label": "Global"
  },
  {
    "id": "us",
    "label": "United States"
  },
  {
    "id": "gb",
    "label": "United Kingdom"
  },
  {
    "id": "de",
    "label": "Germany"
  },
  {
    "id": "eu",
    "label": "Euro area"
  },
  {
    "id": "jp",
    "label": "Japan"
  },
  {
    "id": "ca",
    "label": "Canada"
  },
  {
    "id": "au",
    "label": "Australia"
  },
  {
    "id": "in",
    "label": "India"
  }
];

export const RATES_BOOKS: Record<RatesMarketId, Listing[]> = {
  "global": [
    {
      "symbol": "^IRX",
      "name": "US 13-week",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^FVX",
      "name": "US 5-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^TNX",
      "name": "US 10-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^TYX",
      "name": "US 30-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "TLT",
      "name": "20+y Treasury ETF",
      "kind": "fund"
    },
    {
      "symbol": "LQD",
      "name": "USD investment grade",
      "kind": "fund"
    },
    {
      "symbol": "HYG",
      "name": "USD high yield",
      "kind": "fund"
    },
    {
      "symbol": "EMB",
      "name": "USD emerging bonds",
      "kind": "fund"
    },
    {
      "symbol": "SR3=F",
      "name": "3-month SOFR",
      "kind": "future",
      "digits": 3
    },
    {
      "symbol": "ZQ=F",
      "name": "30-day fed funds",
      "kind": "future",
      "digits": 3
    },
    {
      "symbol": "IGLT.L",
      "name": "iShares UK gilts",
      "kind": "fund"
    },
    {
      "symbol": "EXX6.DE",
      "name": "iShares Germany 10.5y+",
      "kind": "fund"
    },
    {
      "symbol": "SYBB.DE",
      "name": "SPDR euro government",
      "kind": "fund"
    },
    {
      "symbol": "612A.T",
      "name": "ONE JGB ETF",
      "kind": "fund"
    },
    {
      "symbol": "XBB.TO",
      "name": "iShares Canada universe",
      "kind": "fund"
    },
    {
      "symbol": "IAF.AX",
      "name": "iShares Australia composite",
      "kind": "fund"
    },
    {
      "symbol": "GSEC10ADD.NS",
      "name": "DSP Nifty 10y G-Sec",
      "kind": "fund"
    }
  ],
  "us": [
    {
      "symbol": "^IRX",
      "name": "US 13-week",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^FVX",
      "name": "US 5-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^TNX",
      "name": "US 10-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "^TYX",
      "name": "US 30-year",
      "kind": "yield",
      "digits": 3
    },
    {
      "symbol": "ZT=F",
      "name": "2-year note",
      "kind": "future"
    },
    {
      "symbol": "ZF=F",
      "name": "5-year note",
      "kind": "future"
    },
    {
      "symbol": "ZN=F",
      "name": "10-year note",
      "kind": "future"
    },
    {
      "symbol": "ZB=F",
      "name": "US bond future",
      "kind": "future"
    },
    {
      "symbol": "SR3=F",
      "name": "3-month SOFR",
      "kind": "future",
      "digits": 3
    },
    {
      "symbol": "ZQ=F",
      "name": "30-day fed funds",
      "kind": "future",
      "digits": 3
    },
    {
      "symbol": "SHY",
      "name": "1–3y Treasury",
      "kind": "fund"
    },
    {
      "symbol": "IEF",
      "name": "7–10y Treasury",
      "kind": "fund"
    },
    {
      "symbol": "TLT",
      "name": "20+y Treasury",
      "kind": "fund"
    },
    {
      "symbol": "TIP",
      "name": "TIPS",
      "kind": "fund"
    },
    {
      "symbol": "AGG",
      "name": "US aggregate",
      "kind": "fund"
    },
    {
      "symbol": "LQD",
      "name": "Investment grade",
      "kind": "fund"
    },
    {
      "symbol": "HYG",
      "name": "High yield",
      "kind": "fund"
    },
    {
      "symbol": "EMB",
      "name": "USD emerging",
      "kind": "fund"
    }
  ],
  "gb": [
    {
      "symbol": "IGLT.L",
      "name": "iShares Core UK Gilts",
      "kind": "fund"
    },
    {
      "symbol": "VGOV.L",
      "name": "Vanguard UK Gilt",
      "kind": "fund"
    }
  ],
  "de": [
    {
      "symbol": "EXX6.DE",
      "name": "iShares Germany Govt 10.5+",
      "kind": "fund"
    }
  ],
  "eu": [
    {
      "symbol": "SYBB.DE",
      "name": "SPDR Bloomberg Euro Govt",
      "kind": "fund"
    },
    {
      "symbol": "IBCX.L",
      "name": "iShares Core Euro Govt",
      "kind": "fund"
    },
    {
      "symbol": "IBGS.MI",
      "name": "iShares Euro Govt 1–3y",
      "kind": "fund"
    }
  ],
  "jp": [
    {
      "symbol": "612A.T",
      "name": "ONE JGB ETF",
      "kind": "fund"
    }
  ],
  "ca": [
    {
      "symbol": "XBB.TO",
      "name": "iShares Core Canada Universe",
      "kind": "fund"
    },
    {
      "symbol": "ZAG.TO",
      "name": "BMO Aggregate Bond",
      "kind": "fund"
    }
  ],
  "au": [
    {
      "symbol": "IAF.AX",
      "name": "iShares Core Composite Bond",
      "kind": "fund"
    },
    {
      "symbol": "VGB.AX",
      "name": "Vanguard Australian Govt Bond",
      "kind": "fund"
    }
  ],
  "in": [
    {
      "symbol": "GSEC10ADD.NS",
      "name": "DSP Nifty 10y G-Sec ETF",
      "kind": "fund"
    }
  ]
};

export const RATE_IMPLIED = new Set<string>([
  "SR3=F",
  "ZQ=F"
]);

export const RATES_OPTIONABLE = new Set<string>([
  "TLT",
  "IEF",
  "SHY",
  "LQD",
  "HYG",
  "TIP",
  "AGG",
  "EMB",
  "BND"
]);

export const METALS: Listing[] = [
  {
    "symbol": "GC=F",
    "name": "Gold",
    "kind": "metal"
  },
  {
    "symbol": "SI=F",
    "name": "Silver",
    "kind": "metal"
  },
  {
    "symbol": "HG=F",
    "name": "Copper",
    "kind": "metal"
  },
  {
    "symbol": "PL=F",
    "name": "Platinum",
    "kind": "metal"
  },
  {
    "symbol": "PA=F",
    "name": "Palladium",
    "kind": "metal"
  },
  {
    "symbol": "GLD",
    "name": "SPDR Gold",
    "kind": "etf"
  },
  {
    "symbol": "SLV",
    "name": "iShares Silver",
    "kind": "etf"
  },
  {
    "symbol": "CPER",
    "name": "US Copper",
    "kind": "etf"
  }
];

export const ENERGY: Listing[] = [
  {
    "symbol": "CL=F",
    "name": "WTI crude",
    "kind": "energy"
  },
  {
    "symbol": "BZ=F",
    "name": "Brent",
    "kind": "energy"
  },
  {
    "symbol": "NG=F",
    "name": "Henry Hub gas",
    "kind": "energy",
    "digits": 3
  },
  {
    "symbol": "HO=F",
    "name": "Heating oil",
    "kind": "energy"
  },
  {
    "symbol": "RB=F",
    "name": "RBOB gasoline",
    "kind": "energy"
  },
  {
    "symbol": "USO",
    "name": "US Oil Fund",
    "kind": "etf"
  },
  {
    "symbol": "UNG",
    "name": "US Natural Gas Fund",
    "kind": "etf"
  }
];

export const FX_PAIRS: FxPair[] = [
  {
    "symbol": "DX-Y.NYB",
    "name": "Dollar index",
    "kind": "fx",
    "digits": 3,
    "group": "g10"
  },
  {
    "symbol": "EURUSD=X",
    "name": "EUR/USD",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "invert",
    "ecbCode": "EUR"
  },
  {
    "symbol": "GBPUSD=X",
    "name": "GBP/USD",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "invert",
    "ecbCode": "GBP"
  },
  {
    "symbol": "USDJPY=X",
    "name": "USD/JPY",
    "kind": "fx",
    "digits": 2,
    "group": "g10",
    "ecb": "direct",
    "ecbCode": "JPY"
  },
  {
    "symbol": "AUDUSD=X",
    "name": "AUD/USD",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "invert",
    "ecbCode": "AUD"
  },
  {
    "symbol": "USDCAD=X",
    "name": "USD/CAD",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "direct",
    "ecbCode": "CAD"
  },
  {
    "symbol": "USDCHF=X",
    "name": "USD/CHF",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "direct",
    "ecbCode": "CHF"
  },
  {
    "symbol": "NZDUSD=X",
    "name": "NZD/USD",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "invert",
    "ecbCode": "NZD"
  },
  {
    "symbol": "USDSEK=X",
    "name": "USD/SEK",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "direct",
    "ecbCode": "SEK"
  },
  {
    "symbol": "USDNOK=X",
    "name": "USD/NOK",
    "kind": "fx",
    "digits": 4,
    "group": "g10",
    "ecb": "direct",
    "ecbCode": "NOK"
  },
  {
    "symbol": "USDINR=X",
    "name": "USD/INR",
    "kind": "fx",
    "digits": 4,
    "group": "asia",
    "ecb": "direct",
    "ecbCode": "INR"
  },
  {
    "symbol": "CNH=X",
    "name": "USD/CNH",
    "kind": "fx",
    "digits": 4,
    "group": "asia"
  },
  {
    "symbol": "USDHKD=X",
    "name": "USD/HKD",
    "kind": "fx",
    "digits": 4,
    "group": "asia",
    "ecb": "direct",
    "ecbCode": "HKD"
  },
  {
    "symbol": "USDSGD=X",
    "name": "USD/SGD",
    "kind": "fx",
    "digits": 4,
    "group": "asia",
    "ecb": "direct",
    "ecbCode": "SGD"
  },
  {
    "symbol": "USDKRW=X",
    "name": "USD/KRW",
    "kind": "fx",
    "digits": 2,
    "group": "asia",
    "ecb": "direct",
    "ecbCode": "KRW"
  },
  {
    "symbol": "EURJPY=X",
    "name": "EUR/JPY",
    "kind": "fx",
    "digits": 2,
    "group": "cross"
  },
  {
    "symbol": "GBPJPY=X",
    "name": "GBP/JPY",
    "kind": "fx",
    "digits": 2,
    "group": "cross"
  }
];

export const LAB_PRESETS: { symbol: string; name: string }[] = [
  {
    "symbol": "^GSPC",
    "name": "S&P 500"
  },
  {
    "symbol": "^FTSE",
    "name": "FTSE 100"
  },
  {
    "symbol": "^N225",
    "name": "Nikkei 225"
  },
  {
    "symbol": "^GDAXI",
    "name": "DAX"
  },
  {
    "symbol": "^NSEI",
    "name": "Nifty 50"
  },
  {
    "symbol": "^HSI",
    "name": "Hang Seng"
  },
  {
    "symbol": "EURUSD=X",
    "name": "EUR/USD"
  },
  {
    "symbol": "^TNX",
    "name": "US 10-year"
  },
  {
    "symbol": "GC=F",
    "name": "Gold"
  },
  {
    "symbol": "CL=F",
    "name": "WTI"
  }
];

export const PORTFOLIO_SEED = [
  "SPY",
  "EFA",
  "GLD",
  "TLT"
] as const;

EQUITY_BOOKS.us.stock = [
  ...EQUITY_BOOKS.us.stock.filter((row) => row.kind === "index"),
  ...SCREENER.slice(0, 29).map((row) => ({ symbol: row.symbol, name: row.name, kind: "stock" as const })),
];

function addStocks(market: EquityMarketId, rows: { symbol: string; name: string }[]) {
  const book = EQUITY_BOOKS[market].stock;
  for (const row of rows) {
    if (!book.some((item) => item.symbol === row.symbol)) book.push({ symbol: row.symbol, name: row.name, kind: "stock" });
  }
}

addStocks("gb", [
  { symbol: "ULVR.L", name: "Unilever" },
  { symbol: "BP.L", name: "BP" },
  { symbol: "GSK.L", name: "GSK" },
  { symbol: "DGE.L", name: "Diageo" },
  { symbol: "RIO.L", name: "Rio Tinto" },
]);
addStocks("de", [
  { symbol: "ALV.DE", name: "Allianz" },
  { symbol: "DTE.DE", name: "Deutsche Telekom" },
  { symbol: "BMW.DE", name: "BMW" },
  { symbol: "MBG.DE", name: "Mercedes-Benz" },
]);
addStocks("fr", [
  { symbol: "TTE.PA", name: "TotalEnergies" },
  { symbol: "AIR.PA", name: "Airbus" },
  { symbol: "SAN.PA", name: "Sanofi" },
]);
addStocks("nl", [
  { symbol: "PHIA.AS", name: "Philips" },
  { symbol: "INGA.AS", name: "ING" },
  { symbol: "HEIA.AS", name: "Heineken" },
]);
addStocks("ch", [
  { symbol: "RO.SW", name: "Roche" },
  { symbol: "UBSG.SW", name: "UBS" },
]);
addStocks("it", [
  { symbol: "ISP.MI", name: "Intesa Sanpaolo" },
  { symbol: "RACE.MI", name: "Ferrari" },
]);
addStocks("se", [
  { symbol: "ERIC-B.ST", name: "Ericsson" },
  { symbol: "HM-B.ST", name: "H&M" },
]);
addStocks("be", [{ symbol: "KBC.BR", name: "KBC" }]);
addStocks("ca", [
  { symbol: "SHOP.TO", name: "Shopify" },
  { symbol: "ENB.TO", name: "Enbridge" },
]);
addStocks("jp", [
  { symbol: "8306.T", name: "Mitsubishi UFJ" },
  { symbol: "8035.T", name: "Tokyo Electron" },
]);
addStocks("au", [{ symbol: "CSL.AX", name: "CSL" }]);
addStocks("hk", [
  { symbol: "9988.HK", name: "Alibaba" },
  { symbol: "3690.HK", name: "Meituan" },
  { symbol: "0941.HK", name: "China Mobile" },
]);
addStocks("cn", [{ symbol: "601318.SS", name: "Ping An" }]);
addStocks("in", [
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
]);
addStocks("kr", [{ symbol: "005380.KS", name: "Hyundai Motor" }]);
addStocks("sg", [{ symbol: "O39.SI", name: "OCBC" }]);
addStocks("tw", [
  { symbol: "2317.TW", name: "Hon Hai" },
  { symbol: "2454.TW", name: "MediaTek" },
]);

export function listingDigits(symbol: string): number {
  const row = [...Object.values(RATES_BOOKS).flat(), ...METALS, ...ENERGY, ...FX_PAIRS].find((item) => item.symbol === symbol);
  return row?.digits ?? (symbol.endsWith("=X") ? 4 : 2);
}
