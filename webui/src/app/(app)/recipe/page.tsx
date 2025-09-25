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
  Minus,
  Music,
  Plus,
  Radio,
  Save,
  Settings,
  SquarePlus,
  Undo,
} from "lucide-react";
import { useState } from "react";
import { getPlaylists } from "@/app/lib/navidrome";

interface SongsBlock {
  playlist_id: string;
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
      <div className="flex flex-col ml-2">
        <span className="font-semibold">{itemLines[0]}</span>
        <span className="text-sm text-white/70">{itemLines[1]}</span>
      </div>
      <button className="ml-auto p-2 rounded bg-white/10 cursor-pointer">
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
        playlist_id: "ABCD",
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

  const [seq, setSeq] = useState(11);
  const nextID = () => {
    let id = seq;
    setSeq((s) => s + 1);
    return id;
  };
  function withUUID(item: RecipeItem): WithID<RecipeItem> {
    return { id: nextID(), item };
  }

  const [formState, setFormState] = useState<FormState>({ mode: "ListView" });
  const [items, setItems] = useState(originalItems);
  const [hasChanges, setHasChanges] = useState(false);
  const [navidromePlaylists, setNavidromePlaylists] = useState<
    | {
        id: string;
        name: string;
        songCount: number;
        coverArt: string;
      }[]
    | undefined
  >(undefined);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<
    string | undefined
  >(undefined);
  const [numSongs, setNumSongs] = useState(3);

  function updateHasChanges(newItems: WithID<RecipeItem>[]) {
    // Ignore fields added by dnd-kit
    const filteredOriginal = originalItems.map(({ item }) => item);
    const filteredNew = newItems.map(({ item }) => item);
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

  const handleMusicPanelCancel = () => {
    setSelectedPlaylistId(undefined);
    handlePanelCancel();
  };

  const handlePanelCancel = () => {
    setFormState({ mode: "ListView" });
  };

  const handleSave = () => {
    // console.log("Saved items:", items);
  };

  const handleAddMusicBlock = () => {
    const selectedPlaylist = navidromePlaylists?.find(
      (pl) => pl.id === selectedPlaylistId
    );
    const newItem: RecipeItem = {
      type: "songs",
      playlist_id: selectedPlaylistId!,
      playlist_name: selectedPlaylist!.name,
      n_songs: numSongs,
    };
    const newItems = [...items, withUUID(newItem)];
    updateHasChanges(newItems);
    console.log("New item:", withUUID(newItem));
    setItems(newItems);
    handleMusicPanelCancel();
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
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto">
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
          <div className="grid grid-cols-2 gap-3 p-3 bg-relaxing-blue">
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
        </div>
        <div className="flex gap-3 p-3 mt-auto">
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
    );
  } else {
    return (
      <div className="flex flex-col h-full">
        {/* back button */}
        <p className="text-center text-white bg-black/40 p-3">
          <ICONS.songs className="inline-block" />
          <span className="ml-1">Adding Navidrome Block</span>
        </p>
        <p className="text-white p-3">Choose which playlist to play from:</p>
        <div className="px-3">
          {navidromePlaylists === undefined && (
            <p className="text-white/70">Loading playlists...</p>
          )}
          {navidromePlaylists !== undefined &&
            navidromePlaylists.length === 0 && (
              <p className="text-white/70">No playlists found.</p>
            )}
          {navidromePlaylists !== undefined && (
            <div role="radiogroup" aria-label="Navidrome playlists">
              {navidromePlaylists.map((pl) => (
                <label
                  key={pl.id}
                  className={
                    "flex items-center gap-3 p-2 rounded-sm mb-2 cursor-pointer bg-black/10 " +
                    "text-white hover:bg-black/20"
                  }
                >
                  <input
                    type="radio"
                    name="navidrome-playlist"
                    value={pl.id}
                    className="peer sr-only"
                    onChange={() => setSelectedPlaylistId(pl.id)}
                  />
                  <span className="w-5 h-5 inline-grid place-items-center rounded-full border-2 border-white/70 peer-checked:border-white">
                    <span
                      className="w-3 h-3 rounded-full bg-white"
                      style={{
                        display:
                          selectedPlaylistId === pl.id ? "initial" : "none",
                      }}
                    />
                  </span>

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
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="text-white px-3 pb-3">Choose how many songs to play:</p>
        <div className="flex flex-row justify-center px-3 mb-3">
          <button
            className="p-2 bg-black/20 text-white rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setNumSongs((n) => Math.max(1, n - 1))}
            disabled={numSongs <= 1}
            aria-label="Decrease number of songs"
          >
            <Minus />
          </button>
          <input
            type="number"
            className="text-right w-20 bg-black/10 text-white p-2   border-white/20"
            value={numSongs}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) {
                setNumSongs(val);
              }
            }}
            aria-label="Number of songs to play"
          />
          <button
            className="p-2 bg-black/20 text-white rounded-r"
            onClick={() => setNumSongs((n) => n + 1)}
            aria-label="Increase number of songs"
          >
            <Plus />
          </button>
        </div>
        <div className="flex gap-3 m-3 mt-auto">
          <button
            type="button"
            className={
              GRID_BUTTON_CLASSES +
              " flex-1 bg-black/35 text-white disabled:opacity-50 " +
              "disabled:cursor-not-allowed"
            }
            onClick={handleMusicPanelCancel}
          >
            <Undo className="inline-block" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            className={
              GRID_BUTTON_CLASSES +
              " flex-1 bg-secondary-blue text-white disabled:opacity-50 " +
              "disabled:cursor-not-allowed"
            }
            disabled={selectedPlaylistId === undefined}
            onClick={handleAddMusicBlock}
          >
            <SquarePlus className="inline-block" />
            <span>Add Block</span>
          </button>
        </div>
      </div>
    );
  }
}
