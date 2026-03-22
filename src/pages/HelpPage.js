import React, { useState, useRef } from "react";
import "../styles/HelpPage.css";

const HelpPage = () => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  const accountRef = useRef(null);
  const dashboardRef = useRef(null);
  const budgetRef = useRef(null);
  const qrRef = useRef(null);
  const supportRef = useRef(null);

  // ================= TEXT TO SPEECH =================
  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  // ================= SPEECH RECOGNITION =================
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
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

  // SIGN UP
  if (text.includes("sign up") || text.includes("register") || text.includes("create account")) {
    accountRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To sign up to MoneyMap, click the Register button on the homepage, enter your name, email and password, confirm your password, and submit the form."
    );
  }

  // LOGIN
  else if (text.includes("login") || text.includes("log in")) {
    accountRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To login, go to the login page, enter your registered email and password, then click login."
    );
  }

  // RESET PASSWORD
  else if (text.includes("reset password") || text.includes("forgot password")) {
    accountRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To reset your password, click forgot password on the login page, enter your email address, and follow the instructions sent to your inbox."
    );
  }

  // CHANGE PASSWORD
  else if (text.includes("change password")) {
    accountRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To change your password, log in to your account, go to the profile section, update your password and save changes."
    );
  }

  // ADD TRANSACTION
  else if (text.includes("add transaction")) {
    dashboardRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To add a transaction, click add transaction, choose income or expense, enter the details and click save."
    );
  }

  // DOWNLOAD WEEKLY
  else if (text.includes("download weekly") || text.includes("weekly history")) {
    dashboardRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To download weekly transaction history, go to the weekly report section and click download PDF."
    );
  }

  // SET BUDGET
  else if (text.includes("set budget") || text.includes("monthly budget")) {
    budgetRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To set a monthly budget, go to the monthly budget section, enter your spending limit and click save."
    );
  }

  // QR GENERATOR
  else if (text.includes("qr") || text.includes("generate qr")) {
    qrRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To generate a QR code, go to the QR generator page and click generate QR."
    );
  }

  // FEEDBACK
  else if (text.includes("feedback") || text.includes("contact support")) {
    supportRef.current.scrollIntoView({ behavior: "smooth" });
    speakText(
      "To give feedback or contact support, go to the contact page and submit the message form."
    );
  }

  else {
    speakText("Sorry, I could not understand your question. Please try again.");
  }
};

  return (
    <div
      className={`help-container ${highContrast ? "high-contrast" : ""}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <h1>MoneyMap User Manual</h1>

      {/* Accessibility Controls */}
      <div className="accessibility-controls">
        <button onClick={() => setFontSize(fontSize + 2)}>Zoom In</button>
        <button onClick={() => setFontSize(fontSize - 2)}>Zoom Out</button>
        <button onClick={() => setHighContrast(!highContrast)}>
          {highContrast ? "Light Mode" : "Dark Mode"}
        </button>
        <button onClick={startListening}>Ask a Question</button>
      </div>

      {voiceText && <p className="voice-result">You said: {voiceText}</p>}

      {/* ================= ACCOUNT ================= */}
      <section ref={accountRef}>
        <h2>Account Management</h2>

        <h3>How can I sign up to MoneyMap?</h3>
        <p>
          1. Click the Register button on the homepage.<br/>
          2. Enter your name, email and password.<br/>
          3. Confirm your password and submit the form.<br/>
          4. Once registered successfully, log in using your credentials.
        </p>

        <h3>How can I login?</h3>
        <p>
          1. Go to the Login page.<br/>
          2. Enter your registered email and password.<br/>
          3. Click Login to access your dashboard.
        </p>

        <h3>How can I reset my password?</h3>
        <p>
          1. Click Forgot Password on the login page.<br/>
          2. Enter your email address.<br/>
          3. Follow the instructions sent to your inbox.
        </p>

        <h3>How can I change my password?</h3>
        <p>
          Log in → Open Profile → Update your password → Save changes.
        </p>

        <h3>How can I update my profile?</h3>
        <p>
          Navigate to the Profile page, edit your personal details,
          and click Save Changes.
        </p>

        <button onClick={() =>
          speakText("This section explains how to sign up, login, reset password and manage your account.")
        }>
          🔊 Listen
        </button>
      </section>

      {/* ================= DASHBOARD ================= */}
      <section ref={dashboardRef}>
        <h2>Dashboard & Transactions</h2>

        <h3>What can I see on the dashboard?</h3>
        <p>
          The dashboard shows your income, expenses, budget summary,
          reports and quick access to all system features.
        </p>

        <h3>How can I add a transaction?</h3>
        <p>
          Click Add Transaction → Select Income or Expense →
          Enter details → Click Save.
        </p>

        <h3>How can I edit or delete a transaction?</h3>
        <p>
          Go to Transaction History, choose a transaction,
          and select Edit or Delete.
        </p>

        <h3>How can I download weekly transaction history?</h3>
        <p>
          Open the Weekly Report section and click Download PDF.
        </p>

        <button onClick={() =>
          speakText("This section explains dashboard features and transaction management.")
        }>
          🔊 Listen
        </button>
      </section>

      {/* ================= BUDGET ================= */}
      <section ref={budgetRef}>
        <h2>Budget Management</h2>

        <h3>How can I set a monthly budget?</h3>
        <p>
          Go to Monthly Budget → Enter your spending limit →
          Click Save.
        </p>

        <h3>How can I track my spending?</h3>
        <p>
          The system automatically compares your total expenses
          with your budget and displays progress indicators.
        </p>

        <button onClick={() =>
          speakText("This section explains how to set and monitor your monthly budget.")
        }>
          🔊 Listen
        </button>
      </section>

      {/* ================= QR ================= */}
      <section ref={qrRef}>
        <h2>QR Generator</h2>

        <h3>What is the QR Generator used for?</h3>
        <p>
          The QR Generator allows you to share your transaction
          history securely using a scannable QR code.
        </p>

        <h3>How can I generate a QR code?</h3>
        <p>
          Navigate to the QR Generator page and click Generate QR.
        </p>

        <h3>How can I scan the QR code?</h3>
        <p>
          Use your mobile phone camera to scan the QR code
          and view the shared transaction summary.
        </p>

        <button onClick={() =>
          speakText("This section explains how to use the QR generator feature.")
        }>
          🔊 Listen
        </button>
      </section>

      {/* ================= SUPPORT ================= */}
      <section ref={supportRef}>
        <h2>Support & Feedback</h2>

        <h3>How can I give feedback?</h3>
        <p>
          Go to the Contact page and submit your feedback
          using the message form.
        </p>

        <h3>How can I contact support?</h3>
        <p>
          Use the Contact page to send a support request.
          The admin team will review and respond.
        </p>

        <h3>Is my data secure?</h3>
        <p>
          MoneyMap uses secure authentication and protected
          database rules to ensure your financial data remains safe.
        </p>

        <button onClick={() =>
          speakText("This section explains support, feedback and data security.")
        }>
          🔊 Listen
        </button>
      </section>
    </div>
  );
};

export default HelpPage;