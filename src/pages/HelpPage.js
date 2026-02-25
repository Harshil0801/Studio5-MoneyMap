import React, { useState, useRef } from "react";
import "./HelpPage.css";

const HelpPage = () => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  const resetRef = useRef(null);
  const dashboardRef = useRef(null);
  const transactionRef = useRef(null);

  // =============================
  // TEXT TO SPEECH
  // =============================
  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  // =============================
  // SPEECH RECOGNITION
  // =============================
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceText(transcript);
      handleVoiceCommand(transcript);
    };
  };

  const handleVoiceCommand = (text) => {
    if (text.includes("reset")) {
      resetRef.current.scrollIntoView({ behavior: "smooth" });
      speakText(
        "To reset your password, go to login page and click forgot password."
      );
    } else if (text.includes("dashboard")) {
      dashboardRef.current.scrollIntoView({ behavior: "smooth" });
      speakText("The dashboard shows your balance, reports and QR features.");
    } else if (text.includes("transaction")) {
      transactionRef.current.scrollIntoView({ behavior: "smooth" });
      speakText(
        "You can add, edit or delete transactions from the history page."
      );
    } else {
      speakText("Sorry, I could not understand your question.");
    }
  };

  return (
    <div
      className={`help-container ${highContrast ? "high-contrast" : ""}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <h1>User Manual - MoneyMap</h1>

      {/* Accessibility Controls */}
      <div className="accessibility-controls">
        <button onClick={() => setFontSize(fontSize + 2)}>A+</button>
        <button onClick={() => setFontSize(fontSize - 2)}>A-</button>
        <button onClick={() => setHighContrast(!highContrast)}>
          Toggle Contrast
        </button>
        <button onClick={startListening}>🎤 Ask a Question</button>
      </div>

      {voiceText && <p className="voice-result">You said: {voiceText}</p>}

      {/* Getting Started */}
      <section ref={resetRef}>
        <h2>Reset Password</h2>
        <p>
          Go to the Login page → Click "Forgot Password" → Enter your email →
          Check your inbox.
        </p>
        <button
          onClick={() =>
            speakText(
              "To reset password, go to login page and click forgot password."
            )
          }
        >
          🔊 Listen
        </button>
      </section>

      {/* Dashboard */}
      <section ref={dashboardRef}>
        <h2>Dashboard Overview</h2>
        <p>
          The dashboard allows you to view balance summary, weekly reports,
          monthly budget, QR code sharing, and transaction history.
        </p>
        <button
          onClick={() =>
            speakText(
              "The dashboard shows balance summary, reports and QR feature."
            )
          }
        >
          🔊 Listen
        </button>
      </section>

      {/* Transactions */}
      <section ref={transactionRef}>
        <h2>Managing Transactions</h2>
        <p>
          You can add income or expenses, edit them, delete them, and filter by
          date.
        </p>
        <button
          onClick={() =>
            speakText(
              "You can add, edit or delete transactions from the history page."
            )
          }
        >
          🔊 Listen
        </button>
      </section>
    </div>
  );
};

export default HelpPage;