import React, { useEffect, useMemo, useState } from "react";
import { getRatesTable } from "../utils/exchangeRateService";

export default function CurrencyConverterWidget({ defaultTo = "USD" }) {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("NZD");
  const [to, setTo] = useState(defaultTo);
  const [info, setInfo] = useState(null);

  // Fetch exchange rates once
  useEffect(() => {
    (async () => {
      const table = await getRatesTable();
      setInfo(table);
    })();
  }, []);

  const rates = info?.rates || { NZD: 1 };

  // Convert: FROM -> NZD -> TO
  // rates structure: 1 NZD = rates[CUR]
  const result = useMemo(() => {
    const amt = Number(amount);
    if (!amt || isNaN(amt)) return 0;

    const fromRate = from === "NZD" ? 1 : rates[from];
    const toRate = to === "NZD" ? 1 : rates[to];

    if (!fromRate || !toRate) return 0;

    const nzd = from === "NZD" ? amt : amt * (1 / fromRate);
    const out = to === "NZD" ? nzd : nzd * toRate;

    return out;
  }, [amount, from, to, rates]);

  // Get full list of currencies from API
  const currencyList = useMemo(() => {
    const codes = Object.keys(rates);
    if (!codes.includes("NZD")) codes.push("NZD");
    return codes.sort();
  }, [rates]);

  // Use Intl API for full currency names
  const dn = useMemo(() => {
    return new Intl.DisplayNames(["en"], { type: "currency" });
  }, []);

  return (
    <div className="currency-card">
      <h4>Currency Converter</h4>

      <div className="currency-row">
        <input
          type="number"
          value={amount}
          min="0"
          step="0.01"
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: 140 }}
        />

        {/* FROM Currency */}
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {currencyList.map((c) => (
            <option key={c} value={c}>
              {c} - {dn.of(c) || c}
            </option>
          ))}
        </select>

        <span style={{ fontWeight: 800 }}>→</span>

        {/* TO Currency */}
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          {currencyList.map((c) => (
            <option key={c} value={c}>
              {c} - {dn.of(c) || c}
            </option>
          ))}
        </select>
      </div>

      <div className="currency-result">
        Result: {Number(result || 0).toFixed(2)} {to}
      </div>

      <div className="currency-note">
        Status: <b>{info?.status || "CACHED"}</b>
        {info?.timestamp
          ? ` • Updated: ${new Date(info.timestamp).toLocaleString()}`
          : ""}
      </div>
    </div>
  );
}