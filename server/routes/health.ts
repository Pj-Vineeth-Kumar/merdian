import { Router } from "express";

import { env } from "../env";

export const healthRouter = Router();

// Reports the active provider (never the key) so the client can show which
// engine is answering and whether fault demos are available.
healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    provider: env.providerName,
    faultDemo: env.faultDemoEnabled,
  });
});
