import React, { useState } from "react";
import OpenAI from "openai";
import "../styles/BudgetAdvisor.css";

// Initialize OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for testing in React
});

function BudgetAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m your MoneyMap AI Budget Advisor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleToggle = () => setIsOpen(!isOpen);

  // 🧠 Handle message send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    // Show typing animation
    setMessages((prev) => [...prev, { from: "bot", text: "💭 Typing..." }]);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are MoneyMap, a friendly financial assistant that helps users manage money, savings, and expenses in a simple way."
          },
          { role: "user", content: input },
        ],
      });

      const aiMessage = response.choices[0].message.content;

      // Replace typing message with AI response
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { from: "bot", text: aiMessage };
        return copy;
      });
    } catch (error) {
      console.error("OpenAI API Error:", error);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          from: "bot",
          text: "⚠️ Sorry, I couldn’t connect to the AI service right now.",
        };
        return copy;
      });
    }
  };

  return (
    <div className="chatbot">
      {/* Floating chat icon */}
      <button className="chat-toggle" onClick={handleToggle}>
        💬
      </button>

      {/* Chat window */}
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
