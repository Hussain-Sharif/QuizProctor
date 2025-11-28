import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="app-shell">
      <BrowserRouter>
        <main className="app-main">
          <div className="app-container">
            <App />
          </div>
        </main>
      </BrowserRouter>
    </div>
  </React.StrictMode>
);
