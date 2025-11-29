import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BrowserRouter>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <App />
          </div>
        </main>
      </BrowserRouter>
    </div>
  </React.StrictMode>
);
