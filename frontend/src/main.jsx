import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./pages/Landing.jsx";
import { ChatLogs } from "./pages/ChatLogs.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./stylesheets/Base.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat-logs" element={<ChatLogs />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
