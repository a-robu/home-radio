"use client";

import React, { useId } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import RecipeListItem from "./recipe-list-item";
import { RecipeItem, WithID } from "../lib/recipe";

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

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string;
    if (overId != null && activeId !== overId) {
      onSwap(activeId, overId);
    }
  };

  const dndId = useId();

  return (
    <div className={"flex flex-col gap-3 " + className}>
      <DndContext
        id={dndId}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items}>
          {items.map(({ id: id, item }) => (
            <RecipeListItem
              key={id}
              item={item}
              sortableId={id}
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
      </DndContext>
    </div>
  );
}
