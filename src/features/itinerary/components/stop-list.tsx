import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Stop } from "@shared/types";

import { StopCard } from "./stop-card";

interface StopListProps {
  stops: Stop[];
  onReorder: (activeId: string, overId: string) => void;
  onRemoveStop: (stopId: string) => void;
}

/**
 * A day's stops, reorderable via drag (pointer + touch) and keyboard. The
 * KeyboardSensor makes reordering fully operable without a mouse; TouchSensor
 * with a short press-delay keeps it working on phones without hijacking scroll.
 */
export function StopList({ stops, onReorder, onRemoveStop }: StopListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2.5">
          {stops.map((stop) => (
            <StopCard key={stop.id} stop={stop} onRemove={() => onRemoveStop(stop.id)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
