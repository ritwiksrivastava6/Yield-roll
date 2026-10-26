const SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;

export function readSymbolSearch(search: Record<string, unknown>): { symbol?: string } {
  const raw = typeof search.symbol === "string" ? search.symbol.trim().toUpperCase() : "";
  if (!SYMBOL.test(raw)) return {};
  return { symbol: raw };
}

