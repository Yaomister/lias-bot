import "../stylesheets/Landing.css";
import { useState } from "react";

const available_greetings = ["Welcome back", "Hello", "You made it", "Hi"];
var greeting =
  available_greetings[Math.floor(Math.random() * available_greetings.length)];

const Landing = () => {
  const [showMessage, setShowMessage] = useState(false);
  return (
    <div className="landing-page">
      <h1 className="title">{greeting}, Lia!</h1>
      <h2
        className="subtitle"
        onMouseEnter={() => {
          setShowMessage(true);
        }}
        onMouseLeave={() => {
          setShowMessage(false);
        }}
      >
        {showMessage
          ? "You've convinced me to feed your delusions!"
          : "Why am I doing this?"}
      </h2>
      <a className="proceed" href="/history">
        START CHATTING
      </a>
    </div>
  );
};

export { Landing };
