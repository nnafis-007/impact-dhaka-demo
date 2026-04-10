import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReportRecords } from "../services/reportStore";
import { askPoliceReportChatbot } from "../services/chatService";

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello. I can help with police report queries using report-store context. বাংলা প্রশ্ন করলে বাংলায় উত্তর দেব।"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reportRecords = useMemo(() => getAllReportRecords(), []);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askPoliceReportChatbot({
        userMessage: prompt,
        records: reportRecords,
        history: nextMessages
      });

      setMessages((current) => [...current, { role: "assistant", content: String(reply || "") }]);
    } catch (error) {
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>DMP Shohayok</h1>
          <p>Conversational Assistant</p>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate("/app")}>Report Generator</button>
          <button onClick={() => navigate("/reports")}>Report Records</button>
          <button onClick={() => navigate("/hotspots")}>Hotspots</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <section className="card chat-layout">
          <h2>Police Report Chatbot</h2>
          <p className="muted">Using report-store summary context from {reportRecords.length} record(s).</p>

          <div className="chat-log">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && <div className="chat-bubble assistant">Thinking...</div>}
          </div>

          <div className="chat-input-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask in Bangla or English..."
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
