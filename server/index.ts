import cors from "cors";
import express from "express";

import { env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { generateRouter } from "./routes/generate";
import { healthRouter } from "./routes/health";

const app = express();

app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.use("/api", healthRouter);
app.use("/api", generateRouter);

// Error handler must be registered last.
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  console.log(`[server] provider: ${env.providerName} · fault-demo: ${env.faultDemoEnabled}`);
});
