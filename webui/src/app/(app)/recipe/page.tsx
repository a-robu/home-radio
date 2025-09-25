"use client";

import { useId } from "react";
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

interface SongsBlock {
  song_title: string;
  artist_name: string;
}

interface PodcastBlock {
  podcast_name: string;
  backup_podcast_name: string;
}

interface RadioStationBlock {
  station_name: string;
}

interface CaddyFileBlock {
  url: string;
  strategy: "file" | "cycle";
}

// Discriminated union for all recipe items
type RecipeItem =
  | ({ type: "songs" } & SongsBlock)
  | ({ type: "podcast" } & PodcastBlock)
  | ({ type: "radio" } & RadioStationBlock)
  | ({ type: "caddy" } & CaddyFileBlock);

type WithID<T> = {
  id: number;
  item: T;
};

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
  const originalItems: WithID<RecipeItem>[] = [
    {
      id: 1,
      item: {
        type: "songs",
        song_title: "Song Title",
        artist_name: "Artist Name",
      },
    },
    {
      id: 2,
      item: {
        type: "podcast",
        podcast_name: "Podcast Name",
        backup_podcast_name: "Backup Podcast Name",
      },
    },
    {
      id: 3,
      item: {
        type: "radio",
        station_name: "Station Name",
      },
    },
    {
      id: 4,
      item: {
        type: "caddy",
        url: "https://example.com/file.txt",
        strategy: "file",
      },
    },
  ];

  // const [seq, setSeq] = useState(100);
  // const nextID = () => {
  //   setSeq((s) => s + 1);
  //   return seq;
  // };

  const [items, setItems] = useState(originalItems);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDragEnd = (event: any) => {
    const activeId = event.active.id;
    const overId = event.over.id;

    if (activeId !== overId) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, items[oldIndex]);
        // before checking for equality, keep only the id and item keys
        const minimalOriginal = originalItems.map(({ id, item }) => ({
          id,
          item,
        }));
        const minimalNew = newItems.map(({ id, item }) => ({ id, item }));
        setHasChanges(
          !(JSON.stringify(minimalOriginal) === JSON.stringify(minimalNew))
        );
        return newItems;
      });
    }
  };

  const handleCancel = () => {
    setItems(originalItems);
    setHasChanges(false);
  };

  const handleSave = () => {
    console.log("Saved items:", items);
  };

  return (
    <>
      <p className="text-center text-white m-4">
        Add configuration blocks to procedurally generate your daily playlist.
      </p>
      <div className="flex flex-col gap-3 m-3">
        <DndContext
          id={useId()}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items}>
            {items.map((element) => (
              <Sortable key={element.id} id={element.id} />
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
            className={
              GRID_BUTTON_CLASSES +
              " flex-1 bg-black/35 text-white disabled:opacity-50 " +
              "disabled:cursor-not-allowed"
            }
            disabled={!hasChanges}
            onClick={handleCancel}
          >
            <Eraser className="inline-block" />
            <span>Cancel Changes</span>
          </button>
          <button
            type="button"
            className={
              GRID_BUTTON_CLASSES +
              " flex-1 bg-salvation-green text-white disabled:opacity-50 " +
              "disabled:cursor-not-allowed"
            }
            disabled={!hasChanges}
            onClick={handleSave}
          >
            <Save className="inline-block" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </>
  );
}
