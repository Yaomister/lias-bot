import { useEffect, useState } from "react";
import "../stylesheets/Chat.css";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "../api";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    api.get(`/chat/${id}/messages`).then((res) => setMessages(res.data));
  }, [id]);

  const appendChunk = (chunk) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, text: last.text + chunk };
      return updated;
    });
  };

  const sendMessage = async () => {
    const userText = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "ai", text: "" },
    ]);
    console.log("sending:", { chat_id: id, message: userText });
    await fetchEventSource("http://localhost:8000/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: id, text: userText }),
      onmessage(event) {
        if (event.event == "done") {
          return;
        }
        appendChunk(event.data);
      },
      openWhenHidden: true,
      onerror(err) {
        throw err;
      },
    });
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">SOME RANDOM ASS TITLE</h2>
      <div className="chat">
        {messages.map((i, message) => {
          return (
            <div className={`message ${message.sender}`}>{message.text}</div>
          );
        })}
      </div>

      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export { Chat };
