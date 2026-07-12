import type { NextFunction, Request, Response } from "express";

import { faultHeaderSchema } from "@shared/schemas/api";

import { env } from "../env";

declare global {
  // eslint-disable-next-line no-var
  namespace Express {
    interface Request {
      /** Set by faultInjection middleware when a valid x-fault header is present. */
      faultMode?: import("@shared/constants").FaultMode;
    }
  }
}

/**
 * Reads the `x-fault` header and, only when the demo is enabled, attaches a
 * validated fault mode to the request. In production (FAULT_DEMO=0) the header is
 * ignored entirely, so it can never be abused to force failures.
 */
export function faultInjection(req: Request, _res: Response, next: NextFunction): void {
  if (!env.faultDemoEnabled) return next();

  const header = req.header("x-fault");
  if (!header) return next();

  const parsed = faultHeaderSchema.safeParse(header);
  if (parsed.success) {
    req.faultMode = parsed.data;
  }
  next();
}
