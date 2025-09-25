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
  Settings,
} from "lucide-react";
import { useState } from "react";

interface SongsBlock {
  playlist_name: string;
  n_songs: number;
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

const ICONS = {
  songs: Music,
  podcast: Mic,
  radio: Radio,
  caddy: AudioWaveform,
};

function Sortable({ itemWithId }: { itemWithId: WithID<RecipeItem> }) {
  const { id, item } = itemWithId;
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  } as const;

  const ItemIcon = ICONS[item.type];
  let itemLines: string[];
  switch (item.type) {
    case "songs":
      itemLines = [item.playlist_name, `${item.n_songs} songs`];
      break;
    case "podcast":
      itemLines = [item.podcast_name, item.backup_podcast_name];
      break;
    case "radio":
      itemLines = [item.station_name];
      break;
    case "caddy":
      itemLines = [
        item.strategy == "file" ? "Play File" : "Cycle Directory",
        item.url.split("/").pop() || item.url,
      ];
      break;
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={
        "flex justify-start items-center rounded-sm p-2 gap-1.5 bg-black/15 text-white " +
        "select-none cursor-grab active:cursor-grabbing"
      }
    >
      <div className="p-1" aria-label="Drag handle">
        <GripVertical className="touch-manipulation" />
      </div>
      <ItemIcon className="inline-block" />
      {/* e.g. title and artists on two lines */}
      <div className="flex flex-col ml-2">
        <span className="font-semibold">{itemLines[0]}</span>
        <span className="text-sm text-white/70">{itemLines[1]}</span>
      </div>
      <button className="ml-auto p-2 rounded bg-white/10">
        <Settings />
      </button>
    </div>
  );
}

const GRID_BUTTON_CLASSES =
  "flex justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-sm select-none";

export default function Page() {
  const originalItems: WithID<RecipeItem>[] = [
    {
      id: 1,
      item: {
        type: "songs",
        playlist_name: "Happy Morning Songs",
        n_songs: 3,
      },
    },
    {
      id: 2,
      item: {
        type: "podcast",
        podcast_name: "World in 10",
        backup_podcast_name: "Backup: Reuters World News",
      },
    },
    {
      id: 3,
      item: {
        type: "caddy",
        url: "http://vm.peafowl-moth.ts.net:8080/static/mc/01-buna-dimineata.flac",
        strategy: "file",
      },
    },
    {
      id: 4,
      item: {
        type: "radio",
        station_name: "Radio Romania Actualitati",
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
        These blocks generate your playlist.
      </p>
      <div className="flex flex-col gap-3 m-3">
        <DndContext
          id={useId()}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items}>
            {items.map((element) => (
              <Sortable key={element.id} itemWithId={element} />
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-white/80">
                <p>No blocks added yet</p>
                <p className="text-sm text-white/70">
                  Add blocks to get started
                </p>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
      <div className="grid grid-cols-2 gap-3 m-3">
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <ICONS.songs className="inline-block" />
          <span>Add Navidrome</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <ICONS.podcast className="inline-block" />
          <span>Add Podcast</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <ICONS.caddy className="inline-block" />
          <span>Add Caddy File</span>
        </button>
        <button className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}>
          <ICONS.radio className="inline-block" />
          <span>Add Radio Station</span>
        </button>
      </div>
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
    </>
  );
}
