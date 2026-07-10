import { useEffect, useState } from "react";
import api from "../api";
import "../stylesheets/ChatLogs.css";
import { useNavigate } from "react-router-dom";

const ChatLogs = () => {
  const navigate = useNavigate();
  const [chatLogs, setChatLogs] = useState(null);

  useEffect(() => {
    api.get("/chat-logs").then((res) => setChatLogs(res.data));
  }, []);

  if (!chatLogs) return <div className="loading">Loading...</div>;

  if (chatLogs.length == 0) {
    return (
      <div className="chat-logs">
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
    console.log(chatLogs.length);
    return (
      <div className="chat-logs">
        {chatLogs.map((chatLog) => (
          <div>{chatLog}</div>
        ))}
      </div>
    );
  }
};

export { ChatLogs };
