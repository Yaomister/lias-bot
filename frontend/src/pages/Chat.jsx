import { useEffect, useState } from "react";
import "../stylesheets/Chat.css";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "../api";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("New Chat");

  useEffect(() => {
    api.get(`/chat/${id}/messages`).then((res) => setMessages(res.data));
    api.get(`/chat/${id}`).then((res) => setTitle(res.data.title));
  }, [id]);

  const saveTitle = async () => {
    setEditingTitle(false);
    await api.patch(`/chat/${id}`, { title: title });
  };

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
    await fetchEventSource(import.meta.env.VITE_API_URL, {
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
      <div className="top-bar">
        {editingTitle ? (
          <input
            className="chat-title chat-title-editing"
            value={title}
            autoFocus
            onBlur={saveTitle}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                saveTitle();
              }
            }}
          ></input>
        ) : (
          <div
            className="chat-title"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {title}
          </div>
        )}

        <a href="/chat-log" className="back-button">
          Back
        </a>
      </div>

      <div className="chat">
        {messages.map((message, i) => (
          <div key={i} className="message">
            <p className="sender">
              {message.sender == "user" ? "You" : "AI Girlfriend"} :
            </p>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      <div className="input-bar-container">
        <input
          value={input}
          className="input-bar"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export { Chat };
