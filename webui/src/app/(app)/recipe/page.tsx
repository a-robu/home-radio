"use client";

import { useEffect, useId } from "react";
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
  Undo,
} from "lucide-react";
import { useState } from "react";
import { getPlaylists, NavidromePlaylist } from "@/app/lib/navidrome";

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

type FormState =
  | { mode: "ListView" }
  | { mode: "Add"; itemType: RecipeItem["type"] }
  | { mode: "Edit"; itemIndex: number };

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

  const [formState, setFormState] = useState<FormState>({ mode: "ListView" });
  const [items, setItems] = useState(originalItems);
  const [hasChanges, setHasChanges] = useState(false);

  const [navidromePlaylists, setNavidromePlaylists] = useState<
    NavidromePlaylist[] | undefined
  >(undefined);

  function updateHasChanges(newItems: WithID<RecipeItem>[]) {
    // Ignore fields added by dnd-kit
    const filteredOriginal = originalItems.map(({ id, item }) => ({
      id,
      item,
    }));
    const filteredNew = newItems.map(({ id, item }) => ({ id, item }));
    setHasChanges(
      // TODO use a better deep equality check
      !(JSON.stringify(filteredOriginal) === JSON.stringify(filteredNew))
    );
  }

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
        updateHasChanges(newItems);
        return newItems;
      });
    }
  };

  const handleCancel = () => {
    setItems(originalItems);
    setHasChanges(false);
  };

  const handlePanelCancel = () => {
    setFormState({ mode: "ListView" });
  };

  const handleSave = () => {
    console.log("Saved items:", items);
  };

  const dndId = useId();

  useEffect(() => {
    if (
      (formState.mode === "Add" && formState.itemType === "songs") ||
      (formState.mode === "Edit" &&
        items[formState.itemIndex].item.type === "songs")
    ) {
      (async () => {
        if (navidromePlaylists === undefined) {
          let playlists = await getPlaylists();
          setNavidromePlaylists(playlists);
        }
      })();
    }
  }, [formState]);

  if (formState.mode === "ListView") {
    return (
      <>
        <p className="text-center text-white m-4">
          These blocks generate your playlist.
        </p>
        <div className="flex flex-col gap-3 m-3">
          <DndContext
            id={dndId}
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
          <button
            className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}
            onClick={() => setFormState({ mode: "Add", itemType: "songs" })}
          >
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
  } else {
    return (
      <div className="flex flex-col h-full">
        {/* back button */}
        <p className="text-center text-white bg-black/40 p-3">
          <ICONS.songs className="inline-block" />
          <span className="ml-1">Adding Navidrome Block</span>
        </p>
        <p className="text-white p-3">Choose a playlist to play from</p>
        <div className="flex-1 overflow-y-auto px-3">
          {navidromePlaylists === undefined && (
            <p className="text-white/70">Loading playlists...</p>
          )}
          {navidromePlaylists !== undefined &&
            navidromePlaylists.length === 0 && (
              <p className="text-white/70">No playlists found</p>
            )}
          {navidromePlaylists !== undefined &&
            navidromePlaylists.map((pl) => (
              <div
                key={pl.id}
                className="flex items-center gap-3 p-2 rounded-sm bg-black/10 text-white mb-2"
              >
                <img
                  src={`/api/navidrome/get-cover-art?id=${pl.coverArt}&size=64`}
                  alt=""
                  className="w-12 h-12 object-cover rounded-sm bg-black/20"
                />
                <div className="flex flex-col">
                  <div className="font-semibold">{pl.name}</div>
                  <div className="text-sm text-white/70">
                    {pl.songCount ?? 0} songs
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="flex gap-3 m-3 mt-auto">
          <button
            type="button"
            className={
              GRID_BUTTON_CLASSES +
              " flex-1 bg-black/35 text-white disabled:opacity-50 " +
              "disabled:cursor-not-allowed"
            }
            onClick={handlePanelCancel}
          >
            <Undo className="inline-block" />
            <span>Cancel</span>
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
    );
  }
}
