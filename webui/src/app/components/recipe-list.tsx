"use client";

import React, { useId, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import RecipeListItem from "./recipe-list-item";
import { RecipeItem, WithID, ICONS } from "../lib/recipe";
import { GripVertical } from "lucide-react";

type RecipeListProps = {
  items: WithID<RecipeItem>[];
  onSwap: (activeId: string, overId: string) => void;
  /**
   * Provide a per-item handler factory for the settings button.
   * Useful when the handler needs to capture the current item.
   */
  onRowSettingsClick: (id: string) => void;
  className?: string;
};

export default function RecipeList(props: RecipeListProps) {
  const { items, onSwap, onRowSettingsClick, className } = props;
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string;
    if (overId != null && activeId !== overId) {
      onSwap(activeId, overId);
    }
    setActiveId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null);
  };

  const dndId = useId();

  // Sensors tuned for mobile: require a small movement on mouse and a short press delay on touch
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: { y: 10 } },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: { y: 15, x: 6 } },
      onActivation: ({ event }) => event.preventDefault(),
    })
  );

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return items.find((x) => x.id === activeId)?.item ?? null;
  }, [activeId, items]);

  return (
    <div
      className={"flex flex-col gap-3 overscroll-contain " + (className ?? "")}
    >
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(({ id: id, item }) => (
            <RecipeListItem
              key={id}
              item={item}
              sortableId={id}
              isDragging={activeId === id}
              onSettingsClick={() => onRowSettingsClick(id)}
            />
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-white/80">
              <p>No blocks added yet</p>
              <p className="text-sm text-white/70">Add blocks to get started</p>
            </div>
          )}
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 150 }}>
          {activeItem ? (
            <RecipeListItem
              item={activeItem}
              sortableId={"overlay"}
              isDragging={false}
              isOverlay={true}
              onSettingsClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// OverlayListRow removed in favor of rendering RecipeListItem directly
