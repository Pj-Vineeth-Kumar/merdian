import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useReducer, useRef } from "react";

import type { Day, Itinerary } from "@shared/types";

type Action =
  | { type: "reorderStops"; dayId: string; activeId: string; overId: string }
  | { type: "removeStop"; dayId: string; stopId: string }
  | { type: "removeDay"; dayId: string };

function renumber(days: Day[]): Day[] {
  return days.map((day, index) => ({ ...day, dayNumber: index + 1 }));
}

function reducer(state: Itinerary, action: Action): Itinerary {
  switch (action.type) {
    case "reorderStops": {
      const days = state.days.map((day) => {
        if (day.id !== action.dayId) return day;
        const from = day.stops.findIndex((stop) => stop.id === action.activeId);
        const to = day.stops.findIndex((stop) => stop.id === action.overId);
        if (from === -1 || to === -1 || from === to) return day;
        return { ...day, stops: arrayMove(day.stops, from, to) };
      });
      return { ...state, days };
    }
    case "removeStop": {
      const days = state.days.map((day) =>
        day.id === action.dayId
          ? { ...day, stops: day.stops.filter((stop) => stop.id !== action.stopId) }
          : day,
      );
      return { ...state, days };
    }
    case "removeDay": {
      const days = renumber(state.days.filter((day) => day.id !== action.dayId));
      return { ...state, days, durationDays: days.length };
    }
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export interface EditableActions {
  reorderStops: (dayId: string, activeId: string, overId: string) => void;
  removeStop: (dayId: string, stopId: string) => void;
  removeDay: (dayId: string) => void;
}

/**
 * Local, editable copy of a generated itinerary. Seeded from `initial`; the view
 * resets it on a new generation with a React `key` (per CLAUDE.md RC9), so no
 * effect-based syncing is needed. `onChange` fires after every edit so the page
 * can persist the current state to the saved session.
 */
export function useEditableItinerary(
  initial: Itinerary,
  onChange?: (itinerary: Itinerary) => void,
): [Itinerary, EditableActions] {
  const [itinerary, dispatch] = useReducer(reducer, initial);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChangeRef.current?.(itinerary);
  }, [itinerary]);

  const actions: EditableActions = {
    reorderStops: (dayId, activeId, overId) =>
      dispatch({ type: "reorderStops", dayId, activeId, overId }),
    removeStop: (dayId, stopId) => dispatch({ type: "removeStop", dayId, stopId }),
    removeDay: (dayId) => dispatch({ type: "removeDay", dayId }),
  };

  return [itinerary, actions];
}
