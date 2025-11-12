import React, { useState, useEffect, useRef } from "react";
import "../styles/BudgetAdvisor.css";

function BudgetAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true); // 🎧 Sound ON/OFF
  const [listening, setListening] = useState(false); // 🎤 Mic listening state
  const [showTooltip, setShowTooltip] = useState(false); // 💡 Tooltip
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I’m your MoneyMap Assistant — here to guide you with budgeting, spending, and savings! 💸",
    },
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState([]);
  const chatEndRef = useRef(null);

  // 💬 Open / Close chatbot
  const handleToggle = () => {
    setIsOpen(!isOpen);

    // Show tooltip only the first time ever (saved in localStorage)
    if (!isOpen) {
      const seenTooltip = localStorage.getItem("moneyMapTooltipSeen");
      if (!seenTooltip) {
        setShowTooltip(true);
        localStorage.setItem("moneyMapTooltipSeen", "true");
        setTimeout(() => setShowTooltip(false), 6000); // hide after 6s
      }
    }
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 🔊 Voice output (only if soundOn)
  const speak = (text) => {
    if (!soundOn) return;
    const utter = new SpeechSynthesisUtterance(text.replace(/[*_]/g, ""));
    utter.lang = "en-US";
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  // 🔄 Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🎤 Speech-to-Text logic
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
      setTimeout(() => handleSend({ preventDefault: () => {} }), 500);
    };

    recognition.start();
  };

  // 🧠 Smart AI replies (offline)
  const getSmartReply = (msg) => {
    const text = msg.toLowerCase();
    let reply = "";

    if (/(hello|hi|hey|morning|evening)/.test(text)) {
      reply = pick([
        "👋 Hello! Welcome back to MoneyMap.",
        "Hey there! Need help with your budget or tracking expenses today?",
        "Hi! Let's map out your finances together 💰",
      ]);
    } else if (/(feature|function|what can you do|help)/.test(text)) {
      reply =
        "🧭 I can guide you through MoneyMap’s features: creating budgets, tracking expenses, setting savings goals, and viewing reports on your dashboard.";
    } else if (/(report|summary|dashboard|analysis|stats)/.test(text)) {
      reply = pick([
        "📊 You can view your spending summary and income breakdown on the Dashboard page.",
        "Check the Reports section to see your top spending categories and monthly savings trends 📈.",
        "Your MoneyMap Dashboard gives real-time insights into your expenses, income, and budget progress.",
      ]);
    } else if (/(budget|plan|limit)/.test(text)) {
      reply = pick([
        "💡 Try setting up a budget under 'Create Budget' — allocate funds for food, rent, transport, and entertainment.",
        "The 50/30/20 rule is a great start: 50% needs, 30% wants, 20% savings.",
        "Create budgets in MoneyMap and track how much you’ve spent vs. planned!",
      ]);
      setContext((p) => [...p, "budget"]);
    } else if (/(expense|spending|track|cost)/.test(text)) {
      reply = pick([
        "🧾 You can record new expenses directly from your MoneyMap dashboard.",
        "Tracking your expenses daily helps you stay within your monthly budget.",
        "Add each expense under its category — MoneyMap automatically updates your total spending!",
      ]);
      setContext((p) => [...p, "expense"]);
    } else if (/(save|saving|goal|target|fund)/.test(text)) {
      reply = pick([
        "💰 You can set personal saving goals in MoneyMap — it’ll show how close you are each week!",
        "Small, consistent savings are key — add your goal under the Savings tab 🏦.",
        "Create a 'Goal' in MoneyMap and track your progress visually over time.",
      ]);
      setContext((p) => [...p, "saving"]);
    } else if (/(login|sign in|register|sign up|account|password|profile)/.test(text)) {
      if (/(register|sign up|create)/.test(text)) {
        reply =
          "📝 To register, go to the Register page on MoneyMap and fill in your username, email, and password.";
      } else if (/(login|sign in)/.test(text)) {
        reply =
          "🔐 You can log in from the Login page using your registered email and password. If you forgot your password, click ‘Forgot Password’.";
      } else if (/(password|reset)/.test(text)) {
        reply =
          "📧 Go to the Login page and click ‘Forgot Password’. We’ll email you reset instructions.";
      } else if (/(profile|update|account)/.test(text)) {
        reply =
          "👤 You can view or update your profile details (like name or email) from the Profile section in your dashboard.";
      } else {
        reply =
          "🧭 Need help with your account? You can register, log in, or reset your password directly from the MoneyMap login page.";
      }
    } else if (/(motivate|encourage|stress|tired|broke)/.test(text)) {
      reply = pick([
        "🌱 Every small saving counts — keep going, you’re building financial freedom!",
        "💪 You’ve got this! Even a small improvement each week adds up over time.",
        "Remember, progress isn’t about perfection — it’s about consistency 📆.",
      ]);
    } else if (/(thank|thanks|appreciate)/.test(text)) {
      reply = pick([
        "You're welcome! 😊 Happy budgeting with MoneyMap!",
        "No problem — always here to keep your finances on track 💸",
        "Glad I could help! Don’t forget to review your weekly spending summary 📊.",
      ]);
    } else if (/(bye|goodbye|see you)/.test(text)) {
      reply = pick([
        "👋 Bye! Keep checking your MoneyMap dashboard regularly!",
        "Goodbye! Stay smart with your money 💵",
        "Catch you later — your savings goals are waiting for you! 😄",
      ]);
    } else {
      const last = context.slice(-1)[0];
      if (last === "budget")
        reply = "Would you like me to explain how to adjust a budget in MoneyMap?";
      else if (last === "saving")
        reply = "Try setting a new saving goal in MoneyMap to stay motivated! 💪";
      else
        reply = pick([
          "I can help you with budgeting, tracking expenses, saving goals, and understanding your dashboard!",
          "That’s interesting! You can explore more in your MoneyMap dashboard for insights.",
          "I didn’t catch that, but I can help you manage budgets, expenses, and goals.",
        ]);
    }

    speak(reply);
    return reply;
  };

  // 📩 Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setMessages((prev) => [...prev, { from: "bot", text: "💭 Typing..." }]);

    setTimeout(() => {
      const botReply = getSmartReply(input);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { from: "bot", text: botReply };
        return copy;
      });
    }, 800);
  };

  return (
    <div className="chatbot">
      <button className="chat-toggle" onClick={handleToggle}>
        💬
      </button>

    {isOpen && (
        <div className="chat-window">
          {/* 💡 Tooltip */}
          {showTooltip && (
            <div className="tooltip">
              💡 Quick Guide:<br />
              💬 Open/Close Chat<br />
              🎤 Speak your question<br />
              🔊 / 🔇 Toggle Sound<br />
              ❔ Show Help Again<br />
              ✖ Close Chat
            </div>
          )}
          <div className="chat-header">
            <h4>MoneyMap Assistant</h4>
            <button
              className="sound-toggle"
              onClick={() => setSoundOn(!soundOn)}
              title={soundOn ? "Turn sound off" : "Turn sound on"}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
            <button onClick={handleToggle}>✖</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from} fade-in`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "🎙️ Listening..." : "Ask about your MoneyMap features..."}
            />
            {/* 🎤 Mic button */}
            <button
              type="button"
              className={`mic-btn ${listening ? "active" : ""}`}
              onClick={startListening}
              title="Speak your question"
            >
              🎤
            </button>
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default BudgetAdvisor;
