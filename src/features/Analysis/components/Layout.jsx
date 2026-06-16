import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "90vh" }}>
      <Sidebar time={time} />

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}