"use client";

import BlockChoices from "@/app/components/recipe/block-choices";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";

function Sortable({ id }: { id: number }) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  } as const;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex rounded-sm p-2 justify-start gap-1.5 bg-black/15 text-white select-none"
      }
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -m-1"
        aria-label="Drag handle"
      >
        <GripVertical />
      </button>
      Item {id}
    </div>
  );
}

export default function Page() {
  const items = [0, 1, 2, 3];
  return (
    <>
      <p className="text-center text-white m-4">
        Add configuration blocks to procedurally generate your daily playlist.
      </p>
      <div className="flex flex-col gap-3 m-3">
        <DndContext modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={items}>
            {items.map((id) => (
              <Sortable key={id} id={id} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <BlockChoices />
    </>
  );
}
