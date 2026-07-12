import type { ModelItinerary } from "@shared/schemas/itinerary";

import type { CompletionInput, LlmProvider } from "./types";

/**
 * A deterministic, dependency-free provider so the app runs with zero setup and
 * so demos/tests have stable output. It parses a destination and a day count out
 * of the free-form prompt with light heuristics, then assembles a plausible
 * itinerary and returns it as a JSON string — exactly the shape a real model
 * would produce (parsing/validation still runs downstream).
 */
export function createMockProvider(): LlmProvider {
  return {
    name: "mock",
    model: "mock-itinerary-v1",
    async complete({ user, signal }: CompletionInput): Promise<string> {
      // Simulate a little network latency so the loading state is visible.
      await delay(650, signal);
      return mockItineraryJson(user);
    },
  };
}

/** Pure helper: a plausible itinerary as a JSON string. Reused by fault demos. */
export function mockItineraryJson(prompt: string): string {
  return JSON.stringify(buildItinerary(prompt));
}

function buildItinerary(prompt: string): ModelItinerary {
  const destination = guessDestination(prompt);
  const dayCount = guessDayCount(prompt);

  const days = Array.from({ length: dayCount }, (_, index) => ({
    title: DAY_THEMES[index % DAY_THEMES.length]!,
    date: null,
    stops: buildStops(destination, index),
  }));

  return {
    destination,
    summary: `A ${dayCount}-day plan for ${destination}, balancing signature sights, neighborhood food, and downtime. Reorder, expand, or drop any stop to make it yours.`,
    days,
  };
}

const DAY_THEMES = [
  "Arrival & the old center",
  "Museums & markets",
  "Coast & viewpoints",
  "Day trip & local flavors",
  "Neighborhoods & nightlife",
  "Parks & slow morning",
  "Last looks & departure",
];

function buildStops(destination: string, dayIndex: number): ModelItinerary["days"][number]["stops"] {
  const seed = dayIndex;
  const pick = <T>(list: T[]): T => list[(seed + list.length) % list.length]!;

  return [
    {
      name: `${destination} morning walk: ${pick(["harbor loop", "old quarter", "riverside promenade", "market district"])}`,
      category: "sightseeing" as const,
      timeOfDay: "morning" as const,
      durationMinutes: 90,
      description: `Ease into the day on foot and get your bearings around ${destination} before the crowds build.`,
      location: "City center",
      cost: "free" as const,
      tip: "Start early; the light is best and the streets are quiet.",
    },
    {
      name: pick(["Central Market brunch", "Corner cafe tasting", "Street-food alley crawl", "Bakery + espresso stop"]),
      category: "food" as const,
      timeOfDay: "morning" as const,
      durationMinutes: 60,
      description: "Refuel with regional specialties and a strong coffee.",
      location: "Market hall",
      cost: "$" as const,
      tip: null,
    },
    {
      name: pick([
        `${destination} History Museum`,
        `${destination} Museum of Modern Art`,
        "Botanical gardens",
        "Cathedral & viewpoint climb",
      ]),
      category: pick(["culture", "outdoors", "sightseeing"]) as "culture" | "outdoors" | "sightseeing",
      timeOfDay: "afternoon" as const,
      durationMinutes: 120,
      description: "A relaxed afternoon at the day's anchor attraction.",
      location: null,
      cost: "$$" as const,
      tip: "Book a timed ticket online to skip the queue.",
    },
    {
      name: pick(["Sunset rooftop drinks", "Riverside dinner", "Live-music tavern", "Night market wander"]),
      category: pick(["nightlife", "food"]) as "nightlife" | "food",
      timeOfDay: "evening" as const,
      durationMinutes: 120,
      description: "Wind down with dinner and a taste of the local evening scene.",
      location: null,
      cost: "$$" as const,
      tip: null,
    },
  ];
}

function guessDayCount(prompt: string): number {
  const match = prompt.match(/(\d{1,2})\s*(?:-|\s)?\s*days?\b/i);
  if (match?.[1]) {
    const n = Number.parseInt(match[1], 10);
    if (Number.isFinite(n)) return Math.min(Math.max(n, 1), 7);
  }
  if (/\bweek(end)?\b/i.test(prompt)) return /weekend/i.test(prompt) ? 3 : 5;
  return 3;
}

function guessDestination(prompt: string): string {
  const match = prompt.match(
    /\b(?:in|to|at|visiting|around|through)\s+([A-Z][\wÀ-ÿ'’.-]+(?:\s+[A-Z][\wÀ-ÿ'’.-]+){0,2})/,
  );
  if (match?.[1]) return match[1].trim();
  const firstCap = prompt.match(/\b([A-Z][\wÀ-ÿ'’.-]{2,})\b/);
  return firstCap?.[1] ?? "your destination";
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
