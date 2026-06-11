import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { setApiMode, initializeAuthToken } from "./api/apiHandler";

async function init() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    setApiMode(config.apiMode);
  } catch (error) {
    console.warn('Failed to load config.json, using default mode: live');
    setApiMode('live');
  }

  // Initialize auth token from localStorage
  initializeAuthToken();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();