import { KB, FALLBACK } from "./knowledgeBase";

const normalize = (t) => (t || "").toLowerCase().trim();

export function matchIntent(userText, lastTopic) {
  const text = normalize(userText);

  if (!text) return { type: "EMPTY" };

  // Commands
  if (["menu", "help", "?"].includes(text)) return { type: "MENU" };

  // Follow-up based on memory
  if (["more", "tell me more", "steps", "how"].includes(text) && lastTopic) {
    return { type: "KB", payload: lastTopic };
  }

  // Best match by keyword scoring
  let best = null;
  let bestScore = 0;

  for (const item of KB) {
    const score = item.keywords.reduce(
      (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (best && bestScore > 0) return { type: "KB", payload: best };

  return { type: "FALLBACK", payload: FALLBACK };
}