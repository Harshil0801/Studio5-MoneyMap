import { KB, FALLBACK } from "./knowledgeBase";

// -------------------------
// Helpers
// -------------------------
const normalize = (s) => (s || "").toLowerCase().trim();

const levenshtein = (a, b) => {
  a = normalize(a);
  b = normalize(b);
  if (!a) return b.length;
  if (!b) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
};

const tokenScore = (text, keyword) => {
  if (!keyword) return 0;
  if (text.includes(keyword)) return 5;

  // typo tolerance
  const words = text.split(/\s+/).filter(Boolean);
  let best = 0;
  for (const w of words) {
    const dist = levenshtein(w, keyword);
    if (dist === 1) best = Math.max(best, 2);
    if (dist === 2) best = Math.max(best, 1);
  }
  return best;
};

export function searchKB(userText) {
  const text = normalize(userText);
  let bestItem = null;
  let bestScore = 0;

  for (const item of KB) {
    let score = 0;
    for (const kw of item.keywords || []) {
      score += tokenScore(text, normalize(kw));
    }
    score += tokenScore(text, normalize(item.title)) * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem && bestScore >= 3) return bestItem;
  return null;
}

// -------------------------
// Natural language parser
// -------------------------
export function parseTransaction(text) {
  const t = normalize(text);

  const amountMatch = t.match(/(?:\$)?(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? Number(amountMatch[1]) : null;

  const type =
    /(income|salary|earned|received)/.test(t)
      ? "income"
      : /(spent|spend|pay|paid|expense|bought|buy)/.test(t)
      ? "expense"
      : null;

  const categoryMap = [
    { key: "food", words: ["food", "groceries", "grocery", "restaurant", "lunch", "dinner"] },
    { key: "rent", words: ["rent"] },
    { key: "transport", words: ["transport", "bus", "train", "uber", "taxi", "fuel", "petrol", "gas"] },
    { key: "shopping", words: ["shopping", "clothes", "amazon", "store"] },
    { key: "bills", words: ["bill", "bills", "electric", "power", "water", "internet"] },
    { key: "health", words: ["health", "doctor", "pharmacy", "medicine"] },
    { key: "entertainment", words: ["movie", "netflix", "game", "entertainment"] },
  ];

  let category = null;
  for (const c of categoryMap) {
    if (c.words.some((w) => t.includes(w))) {
      category = c.key;
      break;
    }
  }

  let date = null;
  if (t.includes("today")) date = "today";
  else if (t.includes("yesterday")) date = "yesterday";
  else {
    const iso = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (iso) date = iso[1];
  }

  const hasAny = Boolean(amount || type || category || date);

  return {
    ok: Boolean(amount && type),
    hasAny,
    data: { type, amount, category, date },
  };
}

// -------------------------
// Commands
// -------------------------
export function matchCommand(text) {
  const t = normalize(text);
  if (t === "menu" || t === "help" || t === "?") return "MENU";
  if (t === "/status") return "STATUS";
  if (t === "/kb") return "KB";
  if (t === "/clear") return "CLEAR";
  if (t === "/reset") return "RESET";
  if (t === "back") return "BACK";
  if (t === "cancel") return "CANCEL";
  if (t === "more") return "MORE";
  return null;
}

export { FALLBACK };