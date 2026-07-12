import {
  BedDouble,
  Landmark,
  MapPin,
  Moon,
  Mountain,
  Music,
  Palette,
  ShoppingBag,
  Sun,
  Sunrise,
  Sunset,
  TrainFront,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { StopCategory, TimeOfDay } from "@shared/types";

interface CategoryMeta {
  icon: LucideIcon;
  label: string;
  /** Tailwind text color utility wired to a --cat-* token. */
  color: string;
}

const CATEGORY_META: Record<StopCategory, CategoryMeta> = {
  food: { icon: UtensilsCrossed, label: "Food", color: "text-cat-food" },
  sightseeing: { icon: Landmark, label: "Sightseeing", color: "text-cat-sight" },
  outdoors: { icon: Mountain, label: "Outdoors", color: "text-cat-outdoors" },
  culture: { icon: Palette, label: "Culture", color: "text-cat-culture" },
  nightlife: { icon: Music, label: "Nightlife", color: "text-cat-nightlife" },
  shopping: { icon: ShoppingBag, label: "Shopping", color: "text-cat-shopping" },
  transport: { icon: TrainFront, label: "Transport", color: "text-cat-transport" },
  accommodation: { icon: BedDouble, label: "Stay", color: "text-cat-stay" },
  other: { icon: MapPin, label: "Stop", color: "text-cat-other" },
};

export function categoryMeta(category: StopCategory): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.other;
}

const TIME_ICON: Record<TimeOfDay, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

export function timeOfDayIcon(time: TimeOfDay): LucideIcon {
  return TIME_ICON[time];
}
