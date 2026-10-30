
import React, { useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5002/api";

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! 💪 I'm your AI Fitness Coach. Ask me about workouts, protein, meals, or your fitness goal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text = input) {
    const message = text.trim();

    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setError(err.message || "Couldn't connect to AI Coach.");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Suggest a high-protein vegetarian dinner",
    "How can I lose fat while maintaining muscle?",
    "Create a beginner workout plan",
    "Explain my daily protein target",
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.icon}>✦</div>
        <div>
          <h1 style={styles.title}>AI Fitness Coach</h1>
          <p style={styles.subtitle}>
            Your personal fitness and nutrition assistant
          </p>
        </div>
      </div>

      <div style={styles.chat}>
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.role === "user"
                  ? styles.userMessage
                  : styles.aiMessage),
              }}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.message, ...styles.aiMessage }}>
              Thinking... 💭
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                style={styles.suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <form
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your fitness coach..."
            maxLength={2000}
            disabled={loading}
          />
          <button
            style={styles.send}
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Send ↑"}
          </button>
        </form>

        <p style={styles.disclaimer}>
          AI responses can be inaccurate. Verify important nutrition
          information and seek professional advice for medical concerns.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "24px 16px",
    color: "#f4f4f5",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "#164e3a",
    color: "#86efac",
    fontSize: 28,
  },
  title: { margin: 0, fontSize: 26 },
  subtitle: { margin: "7px 0 0", color: "#a1a1aa" },
  chat: {
    background: "#18181b",
    border: "1px solid #303036",
    borderRadius: 18,
    padding: 18,
  },
  messages: {
    minHeight: 280,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  message: {
    padding: "13px 16px",
    borderRadius: 14,
    maxWidth: "85%",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  aiMessage: {
    alignSelf: "flex-start",
    background: "#27272a",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "#166534",
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    margin: "20px 0",
  },
  suggestion: {
    padding: "10px 12px",
    background: "#27272a",
    color: "#e4e4e7",
    border: "1px solid #3f3f46",
    borderRadius: 12,
    cursor: "pointer",
  },
  form: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    borderRadius: 12,
    border: "1px solid #3f3f46",
    background: "#09090b",
    color: "white",
    fontSize: 15,
  },
  send: {
    padding: "12px 18px",
    border: 0,
    borderRadius: 12,
    background: "#22c55e",
    color: "#052e16",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: { color: "#fca5a5" },
  disclaimer: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 0,
  },
};
