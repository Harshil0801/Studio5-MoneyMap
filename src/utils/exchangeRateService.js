// src/utils/exchangeRateService.js

const CACHE_KEY = "moneymap_exchange_rates_v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STALE_GRACE_MS = 5 * 60 * 1000; // 5 minutes grace after TTL
const BASE = "NZD";

// In-memory cache (fastest)
let memoryCache = null;

/**
 * Cached object shape:
 * {
 *   base: "NZD",
 *   timestamp: number,
 *   rates: { USD: 0.61, AUD: 0.92, ... }
 * }
 */
function readLocalCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.rates || !parsed?.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function ageMs(cache) {
  if (!cache?.timestamp) return Infinity;
  return Date.now() - cache.timestamp;
}

function isFresh(cache) {
  return ageMs(cache) < CACHE_TTL_MS;
}

function isWithinStaleGrace(cache) {
  const ms = ageMs(cache);
  return ms >= CACHE_TTL_MS && ms < CACHE_TTL_MS + STALE_GRACE_MS;
}

function getStatus(cache, source, apiFailed = false) {
  if (apiFailed) return "OFFLINE";
  if (source === "api") return "LIVE";
  if (!cache?.timestamp) return "CACHED";
  if (isFresh(cache)) return "CACHED";
  if (isWithinStaleGrace(cache)) return "STALE";
  return "STALE";
}

async function fetchRatesFromApi() {
  // You can keep your current API. If you want a more stable free endpoint later:
  // https://open.er-api.com/v6/latest/NZD
  const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE}`);
  if (!res.ok) {
    throw new Error(`Exchange API failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    base: BASE,
    timestamp: Date.now(),
    rates: data.rates || {},
  };
}

/**
 * Gets full rates table + metadata for UI:
 * {
 *   base, timestamp, rates,
 *   status: "LIVE"|"CACHED"|"STALE"|"OFFLINE",
 *   source: "memory"|"localStorage"|"api"|"fallback"
 * }
 */
export async function getRatesTable({ forceRefresh = false } = {}) {
  // 1) memory cache
  if (!forceRefresh && memoryCache) {
    const status = getStatus(memoryCache, "memory");
    // If memory is fresh, return immediately
    if (isFresh(memoryCache)) return { ...memoryCache, status, source: "memory" };
  }

  // 2) localStorage cache
  const local = readLocalCache();
  if (!forceRefresh && local) {
    memoryCache = local;
    // If local is fresh, return immediately
    if (isFresh(local)) return { ...local, status: "CACHED", source: "localStorage" };
  }

  // Decide if we should fetch
  const shouldFetch =
    forceRefresh ||
    !local ||
    ageMs(local) >= CACHE_TTL_MS; // stale -> try refresh

  if (!shouldFetch && local) {
    return { ...local, status: "CACHED", source: "localStorage" };
  }

  // 3) network fetch (LIVE)
  try {
    const fresh = await fetchRatesFromApi();
    memoryCache = fresh;
    writeLocalCache(fresh);
    return { ...fresh, status: "LIVE", source: "api" };
  } catch (err) {
    // 4) offline fallback (use any cached)
    const fallback = local || memoryCache;
    if (fallback) {
      return {
        ...fallback,
        status: "OFFLINE",
        source: "fallback",
        error: err?.message || "API failed",
      };
    }

    // No cache at all
    return {
      base: BASE,
      timestamp: null,
      rates: { NZD: 1 },
      status: "OFFLINE",
      source: "none",
      error: err?.message || "API failed",
    };
  }
}

/**
 * Gets a single exchange rate for a currency code like "USD"
 * returns 1 for NZD or if missing.
 *
 * NOTE: This returns "NZD -> toCurrency" rate (base NZD table).
 */
export async function getRate(toCurrency) {
  if (!toCurrency || toCurrency === BASE) return 1;
  const table = await getRatesTable();
  return table.rates?.[toCurrency] || 1;
}

/**
 * Force refresh (for "Refresh rates" button)
 */
export async function refreshRates() {
  const fresh = await fetchRatesFromApi();
  memoryCache = fresh;
  writeLocalCache(fresh);
  return { ...fresh, status: "LIVE", source: "api" };
}

/**
 * For UI display (last updated time)
 */
export function getCachedTimestamp() {
  const local = readLocalCache();
  return local?.timestamp || null;
}

/**
 * Extra helpers for UI (optional)
 */
export function getNextRefreshInMs(timestamp) {
  if (!timestamp) return null;
  const next = timestamp + CACHE_TTL_MS;
  return Math.max(0, next - Date.now());
}

export function formatMsToHours(ms) {
  if (ms == null) return "";
  const hours = ms / (1000 * 60 * 60);
  return `${hours.toFixed(1)}h`;
}
