// Public API for the planner feature — the only surface outsiders may import.
export { Hero } from "./components/hero";
export { SearchBar } from "./components/search-bar";
export { PopularDestinations } from "./components/popular-destinations";
export { useItinerary } from "./hooks/use-itinerary";
export type { ItineraryController } from "./hooks/use-itinerary";
export { useTripSession } from "./hooks/use-trip-session";
export type { ItineraryState, TripSession, GenerateOptions } from "./types";
