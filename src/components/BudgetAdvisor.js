import React, { useState } from "react";
import "../styles/BudgetAdvisor.css";

function BudgetAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m your MoneyMap AI Budget Advisor. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setMessages((prev) => [...prev, { from: "bot", text: "💭 Typing..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { from: "bot", text: data.reply || "⚠️ No response from AI" };
        return copy;
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          from: "bot",
          text: "⚠️ Unable to connect to AI service. Try again later.",
        };
        return copy;
      });
    }
  };

  return (
    <div className="chatbot">
      <button className="chat-toggle" onClick={handleToggle}>💬</button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h4>MoneyMap AI Assistant</h4>
            <button onClick={handleToggle}>✖</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default BudgetAdvisor;
