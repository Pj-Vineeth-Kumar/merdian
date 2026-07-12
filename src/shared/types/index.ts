/**
 * Re-exports the shared kernel types so consumers can import from a single
 * place: `import type { Itinerary } from "@shared/types"`.
 */
export type {
  Itinerary,
  Day,
  Stop,
  StopCategory,
  TimeOfDay,
  CostTier,
  ModelItinerary,
} from "../schemas/itinerary";

export type {
  GenerateRequest,
  GenerateResponse,
  GenerateMeta,
  ApiError,
  ApiErrorCode,
} from "../schemas/api";

export type { FaultMode } from "../constants";
