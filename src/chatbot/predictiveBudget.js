// src/chatbot/predictiveBudget.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// ✅ Reads from: /transactions where uid == current user
export async function fetchUserTransactions(uid) {
  const ref = collection(db, "transactions");
  const q = query(ref, where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Try to read time in milliseconds from different formats
function getTxnMs(t) {
  if (t?.createdAt?.toMillis) return t.createdAt.toMillis();
  if (t?.timestamp?.toMillis) return t.timestamp.toMillis();
  if (t?.date?.toMillis) return t.date.toMillis();

  if (typeof t?.createdAt === "number") return t.createdAt;
  if (typeof t?.timestamp === "number") return t.timestamp;

  if (typeof t?.date === "string") {
    const ms = Date.parse(t.date);
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

function isExpense(t) {
  return (t?.type || "").toLowerCase() === "expense";
}

function toAmount(t) {
  const n = Number(t?.amount || 0);
  return Number.isFinite(n) ? n : 0;
}

export function filterLastNDays(transactions, days = 90) {
  const now = Date.now();
  const windowMs = days * 24 * 60 * 60 * 1000;

  return transactions.filter((t) => {
    const ms = getTxnMs(t);
    if (!ms) return false;
    return now - ms <= windowMs;
  });
}

/**
 * ✅ Simple forecast (NO AI):
 * predictedNext30 = (total_last_N_days / N) * 30
 */
export function predictNextMonthBudget(transactionsLastNDays, daysUsed = 90) {
  const expenses = transactionsLastNDays.filter(isExpense);

  const total = expenses.reduce((s, t) => s + toAmount(t), 0);
  const dailyAvg = daysUsed > 0 ? total / daysUsed : 0;
  const predictedTotal = Math.round(dailyAvg * 30);

  // Category forecast
  const catTotals = {};
  for (const t of expenses) {
    const cat = (t?.category || "other").toLowerCase();
    catTotals[cat] = (catTotals[cat] || 0) + toAmount(t);
  }

  const predictedByCategory = {};
  for (const [cat, sum] of Object.entries(catTotals)) {
    predictedByCategory[cat] = Math.round((sum / daysUsed) * 30);
  }

  // Trend warning (last 30 vs previous 30)
  const now = Date.now();
  const d30 = 30 * 24 * 60 * 60 * 1000;

  const last30 = expenses.filter((t) => {
    const ms = getTxnMs(t);
    return ms && now - ms <= d30;
  });

  const prev30 = expenses.filter((t) => {
    const ms = getTxnMs(t);
    return ms && now - ms > d30 && now - ms <= 2 * d30;
  });

  const sumByCat = (arr) => {
    const m = {};
    for (const t of arr) {
      const cat = (t?.category || "other").toLowerCase();
      m[cat] = (m[cat] || 0) + toAmount(t);
    }
    return m;
  };

  const last30Cats = sumByCat(last30);
  const prev30Cats = sumByCat(prev30);

  const warnings = [];
  const allCats = new Set([...Object.keys(last30Cats), ...Object.keys(prev30Cats)]);
  for (const c of allCats) {
    const last = last30Cats[c] || 0;
    const prev = prev30Cats[c] || 0;
    if (prev > 0) {
      const pct = Math.round(((last - prev) / prev) * 100);
      if (pct >= 15) warnings.push(`${c} trending up (+${pct}%)`);
    }
  }

  return {
    predictedTotal,
    predictedByCategory,
    totalLastNDays: Math.round(total),
    warnings,
    daysUsed,
  };
}

export function formatForecastText(result) {
  const lines = [];
  lines.push(`📈 Predicted spending (next 30 days): $${result.predictedTotal}`);
  lines.push(`(Based on last ${result.daysUsed} days expenses: $${result.totalLastNDays})`);
  lines.push("");
  lines.push("💡 Suggested category budgets:");

  const sorted = Object.entries(result.predictedByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  for (const [cat, amt] of sorted) {
    lines.push(`• ${cat}: $${amt}`);
  }

  if (result.warnings.length) {
    lines.push("");
    lines.push("⚠️ Trends:");
    for (const w of result.warnings.slice(0, 5)) lines.push(`• ${w}`);
  }

  lines.push("");
  lines.push("Tip: Type 'add transaction' to improve prediction accuracy ✅");

  return lines.join("\n");
}