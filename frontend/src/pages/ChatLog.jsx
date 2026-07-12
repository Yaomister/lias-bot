import { useEffect, useState } from "react";
import api from "../api";
import "../stylesheets/ChatLog.css";
import { useNavigate } from "react-router-dom";

const ChatLog = () => {
  const navigate = useNavigate();
  const [chatLog, setChatLog] = useState(null);

  useEffect(() => {
    api
      .get("/chat-log")
      .then((res) => {
        console.log("GOT IT");

        setChatLog(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!chatLog) return <div className="loading">Loading...</div>;

  console.error(chatLog);

  if (chatLog.length == 0) {
    return (
      <div className="chat-log">
        <h1>We haven't been talking...</h1>
        <button
          className="new-chat"
          onClick={async () => {
            const newChat = await api.post("create-chat");
            navigate(`/chat/${newChat.data.id}`);
          }}
        >
          Let's talk
        </button>
      </div>
    );
  } else {
    return (
      <div className="chat-log">
        <h2>Conversations</h2>
        <div className="chat-log-entries-container">
          {chatLog.map((entry) => (
            <div
              className="chat-entry"
              onClick={() => {
                navigate(`/chat/${entry.id}`);
              }}
            >
              <p className="chat-entry-title">{entry.title}</p>
              <p className="chat-entry-time">
                {new Date(entry.createdAt + "Z").toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="buttons-container">
          <button
            className="back-button"
            onClick={() => {
              navigate("/");
            }}
          >
            Back
          </button>
          <button
            className="snew-chat-button"
            onClick={async () => {
              const newChat = await api.post("create-chat");
              navigate(`/chat/${newChat.data.id}`);
            }}
          >
            New Chat
          </button>
        </div>
      </div>
    );
  }
};

export { ChatLog };
