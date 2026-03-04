import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// ═══════════════════════════════════════════════
//  PRODUCTION: Suppress ALL console output
//  Prevents error/debug info from leaking in DevTools
// ═══════════════════════════════════════════════
if (process.env.NODE_ENV === "production") {
  const noop = () => { };
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.info = noop;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
