import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (no external <link>): a distinctive display/body/mono trio.
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";

import { App } from "./app/app";
import { Providers } from "./app/providers";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
