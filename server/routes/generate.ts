import { Router } from "express";

import { generateRequestSchema } from "@shared/schemas/api";

import { LlmError } from "../llm/errors";
import { generateItinerary } from "../llm/generate-itinerary";
import { faultInjection } from "../middleware/fault-injection";

export const generateRouter = Router();

generateRouter.post("/generate", faultInjection, async (req, res, next) => {
  // 1. Validate the client's request (untrusted input, just like the LLM output).
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return next(new LlmError("bad_request", message, { retryable: false, httpStatus: 400 }));
  }

  // 2. Abort the upstream call if the client disconnects (frees the model call).
  const controller = new AbortController();
  const onClose = () => controller.abort();
  res.on("close", () => {
    if (!res.writableEnded) onClose();
  });

  // 3. Run the pipeline. Any failure is a typed LlmError handled downstream.
  try {
    const result = await generateItinerary({
      prompt: parsed.data.prompt,
      signal: controller.signal,
      fault: req.faultMode,
      dateRange: parsed.data.dateRange,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
