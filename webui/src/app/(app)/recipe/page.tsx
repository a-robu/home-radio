"use client";

import { DndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  AudioWaveform,
  Eraser,
  GripVertical,
  Mic,
  Music,
  Radio,
  Save,
} from "lucide-react";
import { useState } from "react";

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
      className="flex rounded-sm p-2 justify-start gap-1.5 bg-black/15 text-white select-none"
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

const GRID_BUTTON_CLASSES =
  "flex justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-sm";

export default function Page() {
  const [items, setItems] = useState([0, 1, 2, 3]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, active.id);
        return newItems;
      });
    }
  };

  return (
    <>
      <p className="text-center text-white m-4">
        Add configuration blocks to procedurally generate your daily playlist.
      </p>
      <div className="flex flex-col gap-3 m-3">
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items}>
            {items.map((id) => (
              <Sortable key={id} id={id} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="grid grid-cols-2 gap-3 m-3">
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <Music className="inline-block" />
          <span>Add Navidrome</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <Mic className="inline-block" />
          <span>Add Podcast</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <AudioWaveform className="inline-block" />
          <span>Add Caddy File</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <Radio className="inline-block" />
          <span>Add Radio Station</span>
        </button>
      </div>
      <div>
        <div className="flex gap-3 m-3">
          <button
            type="button"
            className={GRID_BUTTON_CLASSES + " flex-1 bg-black/35 text-white"}
          >
            <Eraser className="inline-block" />
            <span>Cancel Changes</span>
          </button>
          <button
            type="button"
            className={
              GRID_BUTTON_CLASSES + " flex-1 bg-salvation-green text-white"
            }
          >
            <Save className="inline-block" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </>
  );
}
