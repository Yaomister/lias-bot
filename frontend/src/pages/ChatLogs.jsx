import api from "../api";

const ChatLogs = async () => {
  const chatLogs = await api.get("/chat-logs");

  console.log(chatLogs);

  if (chatLogs.data == "NONE") {
    return (
      <div className="chat-logs">
        <div className="chat-log-entires-container">
          <h2>Past conversations</h2>
        </div>
        <h1>DWADWADWAW</h1>
        <button className="empty-new-chat">let's talk</button>
      </div>
    );
  } else {
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
