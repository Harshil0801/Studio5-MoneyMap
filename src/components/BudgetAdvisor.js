import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/BudgetAdvisor.css";

import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

import { KB, FALLBACK } from "../chatbot/knowledgeBase";
import { matchCommand, parseTransaction, searchKB } from "../chatbot/chatbotEngine";

// ✅ Predictive Budget (NO AI)
import {
  fetchUserTransactions,
  predictNextMonthBudget,
  formatForecastText,
} from "../chatbot/predictiveBudget";

const STORAGE_KEY = "moneymap_chat_state_v2";
const TYPING_TEXT = "💭 Typing...";

function BudgetAdvisor() {
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I’m your MoneyMap Assistant. Type 'menu' to see features, or type: “spent 45 on food today”.",
      actions: [],
      chips: ["menu", "forecast", "qr", "currency", "add transaction"],
    },
  ]);

  const [flow, setFlow] = useState({
    mode: null, // "ADD_TXN" | null
    step: 0,
    draft: { type: null, amount: null, category: null, date: null },
  });

  const [input, setInput] = useState("");

  const user = auth.currentUser;

  // ---- Speak ----
  const speak = (text) => {
    if (!soundOn) return;
    const utter = new SpeechSynthesisUtterance((text || "").replace(/[*_]/g, ""));
    utter.lang = "en-US";
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  // ---- Persist / Restore ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.messages?.length) setMessages(parsed.messages);
      if (parsed?.flow) setFlow(parsed.flow);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, flow }));
    } catch {
      // ignore
    }
  }, [messages, flow]);

  // ---- Auto scroll ----
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Helpers ----
  const pushBot = (text, { actions = [], chips = [] } = {}) => {
    setMessages((prev) => [...prev, { from: "bot", text, actions, chips }]);
    speak(text);
  };

  const pushUser = (text) => {
    setMessages((prev) => [...prev, { from: "user", text }]);
  };

  const typing = () => {
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: TYPING_TEXT, actions: [], chips: [], isTyping: true },
    ]);
  };

  const replaceLastTyping = (payload) => {
    setMessages((prev) => {
      const copy = [...prev];
      const idx = copy.map((m) => m?.isTyping).lastIndexOf(true);
      if (idx === -1) return prev;
      copy[idx] = { from: "bot", ...payload, isTyping: false };
      return copy;
    });
  };

  const removeLastTyping = () => {
    setMessages((prev) => {
      const copy = [...prev];
      const idx = copy.map((m) => m?.isTyping).lastIndexOf(true);
      if (idx === -1) return prev;
      copy.splice(idx, 1);
      return copy;
    });
  };

  // ---- Toggle ----
  const handleToggle = () => {
    setIsOpen((v) => !v);

    if (!isOpen) {
      const seenTooltip = localStorage.getItem("moneyMapTooltipSeen");
      if (!seenTooltip) {
        setShowTooltip(true);
        localStorage.setItem("moneyMapTooltipSeen", "true");
        setTimeout(() => setShowTooltip(false), 6000);
      }
    }
  };

  // ---- Speech to Text ----
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser 😔");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend({ preventDefault: () => {} }, transcript), 200);
    };

    recognition.start();
  };

  // ---- Navigation policy ----
  const comingSoonRoutes = useMemo(() => new Set(["/reports"]), []);
  const authPages = useMemo(
    () => new Set(["/login", "/register", "/forgot-password"]),
    []
  );
  const protectedRoutes = useMemo(
    () =>
      new Set([
        "/dashboard",
        "/generate-qr",
        "/transaction-pdf",
        "/update-profile",
        "/add-transaction",
        "/converter",
        "/reports",
      ]),
    []
  );

  const handleActionClick = (route) => {
    if (!route) return;

    if (comingSoonRoutes.has(route)) {
      pushBot("🚧 Reports/Export is coming soon. (Not implemented yet)");
      return;
    }

    if (user && authPages.has(route)) {
      pushBot("✅ You are already logged in.", {
        actions: [{ label: "Go to Dashboard", route: "/dashboard" }],
        chips: ["dashboard", "qr", "currency", "forecast"],
      });
      return;
    }

    if (!user && protectedRoutes.has(route)) {
      pushBot("🔐 Please login to access this feature.", {
        actions: [{ label: "Go to Login", route: "/login" }],
        chips: ["login", "register", "forgot password"],
      });
      return;
    }

    navigate(route);
  };

  // ---- Wizard: Add Transaction ----
  const startAddTxnWizard = (prefill = {}) => {
    setFlow({
      mode: "ADD_TXN",
      step: 1,
      draft: {
        type: prefill.type || null,
        amount: prefill.amount || null,
        category: prefill.category || null,
        date: prefill.date || null,
      },
    });

    pushBot("🧾 Let’s add a transaction. What type is it?", {
      chips: ["expense", "income", "cancel"],
    });
  };

  const finishAddTxnWizard = (draft) => {
    try {
      localStorage.setItem("moneymap_txn_draft", JSON.stringify(draft));
    } catch {
      // ignore
    }

    pushBot(
      `✅ Draft ready: ${draft.type} $${draft.amount}${
        draft.category ? `, ${draft.category}` : ""
      }${draft.date ? `, ${draft.date}` : ""}.`,
      {
        actions: [{ label: "Open Add Transaction", route: "/add-transaction" }],
        chips: ["add another", "menu", "forecast"],
      }
    );

    setFlow({
      mode: null,
      step: 0,
      draft: { type: null, amount: null, category: null, date: null },
    });
  };

  const handleAddTxnStep = (text) => {
    const t = (text || "").toLowerCase().trim();

    if (t === "cancel") {
      setFlow({
        mode: null,
        step: 0,
        draft: { type: null, amount: null, category: null, date: null },
      });
      pushBot("✅ Cancelled. Type 'menu' to continue.", { chips: ["menu"] });
      return true;
    }

    if (t === "back") {
      setFlow((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
      pushBot("↩️ Going back. What was your previous answer?", { chips: ["cancel"] });
      return true;
    }

    if (t === "add another") {
      startAddTxnWizard();
      return true;
    }

    if (flow.step === 1) {
      if (t !== "income" && t !== "expense") {
        pushBot("Please type: income or expense.", {
          chips: ["expense", "income", "cancel"],
        });
        return true;
      }
      setFlow((prev) => ({ ...prev, step: 2, draft: { ...prev.draft, type: t } }));
      pushBot("💰 How much? (example: 45)", { chips: ["cancel", "back"] });
      return true;
    }

    if (flow.step === 2) {
      const m = t.match(/(\d+(?:\.\d{1,2})?)/);
      if (!m) {
        pushBot("Please enter a valid number (example: 45).", {
          chips: ["cancel", "back"],
        });
        return true;
      }
      const amount = Number(m[1]);
      setFlow((prev) => ({ ...prev, step: 3, draft: { ...prev.draft, amount } }));
      pushBot("🏷️ Category? (food, rent, transport, bills, shopping) or type 'skip'.", {
        chips: ["food", "rent", "transport", "bills", "shopping", "skip", "back", "cancel"],
      });
      return true;
    }

    if (flow.step === 3) {
      const category = t === "skip" ? null : t;
      setFlow((prev) => ({ ...prev, step: 4, draft: { ...prev.draft, category } }));
      pushBot("📅 Date? (today, yesterday, or YYYY-MM-DD) or type 'skip'.", {
        chips: ["today", "yesterday", "skip", "back", "cancel"],
      });
      return true;
    }

    if (flow.step === 4) {
      const isIso = /^\d{4}-\d{2}-\d{2}$/.test(t);
      const date =
        t === "skip"
          ? null
          : t === "today" || t === "yesterday" || isIso
          ? t
          : null;

      if (t !== "skip" && !date) {
        pushBot("Please type: today, yesterday, YYYY-MM-DD, or skip.", {
          chips: ["today", "yesterday", "skip", "back", "cancel"],
        });
        return true;
      }

      finishAddTxnWizard({ ...flow.draft, date });
      return true;
    }

    return false;
  };

  // ---- Reply engine ----
  const buildReply = (userText) => {
    const cmd = matchCommand(userText);

    if (cmd === "STATUS") {
      const status = `📍 Page: ${location.pathname}\n👤 Logged in: ${user ? "Yes" : "No"}`;
      return { text: status, actions: [], chips: ["menu", "/kb"] };
    }

    if (cmd === "KB") {
      const list = KB.map((k) => `• ${k.title}`).join("\n");
      return { text: `📚 Topics:\n${list}`, actions: [], chips: ["menu"] };
    }

    if (cmd === "MENU") {
      let menuItems = KB.map((k) => ({
        label: k.title,
        route: k.actions?.[0]?.route,
      })).filter((a) => a.route);

      if (user) {
        menuItems = menuItems.filter(
          (x) => !["/login", "/register", "/forgot-password"].includes(x.route)
        );
      }

      return {
        text: "🧭 Choose a feature:",
        actions: menuItems,
        chips: user
          ? ["dashboard", "qr", "currency", "forecast"]
          : ["login", "register", "forgot password"],
      };
    }

    // Wizard active
    if (flow.mode === "ADD_TXN") {
      const handled = handleAddTxnStep(userText);
      if (handled) return { text: "" };
    }

    // Natural language transaction detection
    const parsed = parseTransaction(userText);
    if (parsed.hasAny) {
      if (parsed.ok) {
        startAddTxnWizard(parsed.data);
        return { text: "" };
      }
      return {
        text: "🧠 I detected a transaction, but I need more info. Type 'add transaction' to use the wizard.",
        actions: [{ label: "Start Add Wizard", route: "__START_ADD_WIZARD__" }],
        chips: ["add transaction", "menu"],
      };
    }

    const t = (userText || "").toLowerCase().trim();
    if (t.includes("add transaction") || t === "add") {
      startAddTxnWizard();
      return { text: "" };
    }

    if (t === "forecast" || t === "predict budget" || t === "budget suggestion") {
      return {
        text: "✅ Type: forecast (or predict budget). I will suggest next month budget from your expense history.",
        actions: [],
        chips: ["forecast", "menu"],
      };
    }

    // KB search
    const item = searchKB(userText);
    if (item) {
      return {
        text: item.answer,
        actions: item.actions || [],
        chips: ["menu", "add transaction", "forecast"],
      };
    }

    return { text: FALLBACK, actions: [], chips: ["menu", "forecast"] };
  };

  // ---- Send ----
  const handleSend = (e, forcedText = null) => {
    e.preventDefault();
    const value = (forcedText ?? input).trim();
    if (!value) return;

    if (value === "__START_ADD_WIZARD__") {
      startAddTxnWizard();
      setInput("");
      return;
    }

    pushUser(value);
    setInput("");
    typing();

    const lower = value.toLowerCase().trim();

    // ✅ Forecast (Async) — FIXED (no broken try/catch)
    if (lower === "forecast" || lower === "predict budget" || lower === "budget suggestion") {
      (async () => {
        try {
          const currentUser = auth.currentUser;

          if (!currentUser) {
            removeLastTyping();
            pushBot("🔐 Please login so I can read your transactions and generate forecast.", {
              actions: [{ label: "Go to Login", route: "/login" }],
              chips: ["login", "menu"],
            });
            return;
          }

          const allTxns = await fetchUserTransactions(currentUser.uid);

          // ✅ Only count expense transactions (your table shows Expense/Income)
          const expenses = allTxns.filter(
            (t) => (t.type || "").toLowerCase() === "expense"
          );

          if (expenses.length < 5) {
            removeLastTyping();
            pushBot("📊 Please add at least 5 expense transactions for accurate forecast.", {
              chips: ["add transaction", "menu"],
            });
            return;
          }

          const result = predictNextMonthBudget(expenses, 90);
          const text = formatForecastText(result);

          replaceLastTyping({
            text,
            actions: [],
            chips: ["menu", "add transaction", "forecast"],
          });
        } catch (err) {
          removeLastTyping();
          pushBot("⚠️ Forecast failed. Check console (F12).");
          console.error(err);
        }
      })();

      return;
    }

    // Normal flow
    setTimeout(() => {
      try {
        const reply = buildReply(value);

        if (!reply?.text && !reply?.actions?.length && !reply?.chips?.length) {
          removeLastTyping();
          return;
        }

        replaceLastTyping({
          text: reply.text,
          actions: (reply.actions || []).map((a) => ({ label: a.label, route: a.route })),
          chips: reply.chips || [],
        });
      } catch (err) {
        removeLastTyping();
        pushBot("⚠️ Something went wrong in chatbot logic. Check console (F12).");
        console.error("Chatbot error:", err);
      }
    }, 450);
  };

  const onAction = (route) => {
    if (route === "__START_ADD_WIZARD__") {
      startAddTxnWizard();
      return;
    }
    handleActionClick(route);
  };

  return (
    <div className="chatbot">
      <button className="chat-toggle" onClick={handleToggle}>
        💬
      </button>

      {isOpen && (
        <div className="chat-window">
          {showTooltip && (
            <div className="tooltip">
              💡 Quick Guide:
              <br />
              Type <b>menu</b> to see features
              <br />
              Type <b>forecast</b> to predict next month budget
              <br />
              Use <b>cancel</b> or <b>back</b> in wizard
              <br />
              🔊 / 🔇 Toggle Sound
              <br />
              ✖ Close Chat
            </div>
          )}

          <div className="chat-header">
            <h4>MoneyMap Assistant</h4>

            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className="sound-toggle"
                onClick={() => setSoundOn(!soundOn)}
                title={soundOn ? "Turn sound off" : "Turn sound on"}
              >
                {soundOn ? "🔊" : "🔇"}
              </button>

              <button onClick={handleToggle} title="Close">
                ✖
              </button>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from} fade-in`}>
                <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                {msg.from === "bot" && msg.actions?.length > 0 && (
                  <div className="chat-actions">
                    {msg.actions.map((a, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="chat-action-btn"
                        onClick={() => onAction(a.route)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                {msg.from === "bot" && msg.chips?.length > 0 && (
                  <div className="chat-actions">
                    {msg.chips.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="chat-action-btn"
                        onClick={() => handleSend({ preventDefault: () => {} }, c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening ? "🎙️ Listening..." : "Try: menu | forecast | spent 45 on food today | /status"
              }
            />

            <button
              type="button"
              className={`mic-btn ${listening ? "active" : ""}`}
              onClick={startListening}
              title="Speak your question"
            >
              🎤
            </button>

            <button type="submit" title="Send">
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default BudgetAdvisor;