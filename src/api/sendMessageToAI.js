// src/api/sendMessageToAI.js

export const sendMessageToAI = async (message) => {
  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (data.reply) {
      return data.reply;
    } else {
      return "⚠️ No response from AI";
    }
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "⚠️ No response from AI";
  }
};
