import { useEffect, useState } from "react";

const Typewriter = ({ children }) => {
  const [display, setDisplay] = useState("");
  const text = children;

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplay(text.slice(0, index));
      if (index > text.length) {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [text]);

  return <h1>{display}</h1>;
};

export default Typewriter;
