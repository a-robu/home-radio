"use client";

import { useEffect } from "react";
import RecipeList from "@/app/components/recipe-list";
import {
  Eraser,
  Minus,
  Plus,
  Save,
  SquareCheck,
  SquarePlus,
  Trash2,
  Undo,
} from "lucide-react";
import { useState } from "react";
import { getPlaylists } from "@/app/lib/navidrome";
import { ICONS, RecipeItem, withID, WithID } from "@/app/lib/recipe";
type FormState =
  | { mode: "ListView" }
  | { mode: "Add"; itemType: RecipeItem["type"] }
  | { mode: "Edit"; itemIndex: number };

const GRID_BUTTON_CLASSES =
  "flex justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-sm select-none";

export default function Page() {
  const originalItems: WithID<RecipeItem>[] = [
    withID({
      type: "songs",
      playlist_id: "ABCD",
      playlist_name: "Happy Morning Songs",
      n_songs: 3,
    }),
    withID({
      type: "podcast",
      podcast_name: "World in 10",
      backup_podcast_name: "Backup: Reuters World News",
    }),
    withID({
      type: "caddy",
      url: "http://vm.peafowl-moth.ts.net:8080/static/mc/01-buna-dimineata.flac",
      strategy: "file",
    }),
    withID({
      type: "radio",
      station_name: "Radio Romania Actualitati",
    }),
  ];

  const [formState, setFormState] = useState<FormState>({ mode: "ListView" });
  const [items, setItems] = useState<WithID<RecipeItem>[]>(originalItems);
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
  const [numSongs, setNumSongs] = useState(1);

  useEffect(() => {
    const filteredOriginal = originalItems.map(({ item }) => item);
    const filteredNew = items.map(({ item }) => item);
    setHasChanges(
      // TODO use a better deep equality check
      !(JSON.stringify(filteredOriginal) === JSON.stringify(filteredNew))
    );
  }, [items]);

  const handleSwap = (activeId: string, overId: string) => {
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);

    const newItems = [...items];
    const [movedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, movedItem);
    setItems(newItems);
  };

  const handleCancel = () => {
    setItems(originalItems);
    setHasChanges(false);
  };

  const handleMusicPanelCancel = () => {
    setSelectedPlaylistId(undefined);
    setNumSongs(1);
    handlePanelCancel();
  };

  const handlePanelCancel = () => {
    setFormState({ mode: "ListView" });
  };

  const handleSave = () => {
    console.log("Mock handleSave:", items);
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
    const newItems = [...items, withID(newItem)];
    console.log("New item:", withID(newItem));
    setItems(newItems);
    handleMusicPanelCancel();
  };

  const handleUpdateMusicBlock = () => {
    if (formState.mode !== "Edit") {
      throw new Error("Expected formState.mode to be 'Edit' mode");
    }
    const currentItem = items[formState.itemIndex].item;
    if (currentItem.type !== "songs") {
      throw new Error("Expected item to be of type 'songs'");
    }
    const updated: RecipeItem = {
      ...currentItem,
      playlist_id: selectedPlaylistId!,
      n_songs: numSongs,
    };
    const newItems = [...items];
    newItems[formState.itemIndex] = {
      ...newItems[formState.itemIndex],
      item: updated,
    };
    setItems(newItems);
    handleMusicPanelCancel();
  };

  const handleMusicPanelDeleteBlock = () => {
    if (formState.mode !== "Edit") {
      throw new Error("Expected formState.mode to be 'Edit' mode");
    }
    const newItems = items.filter((_, idx) => idx !== formState.itemIndex);
    setItems(newItems);
    handleMusicPanelCancel();
  };

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
          <RecipeList
            className="m-3"
            items={items}
            onSwap={handleSwap}
            onRowSettingsClick={(id) => {
              let index = items.findIndex((x) => x.id === id);
              let item = items[index].item;
              setFormState({
                mode: "Edit",
                itemIndex: index,
              });
              if (item.type === "songs") {
                setSelectedPlaylistId(item.playlist_id);
                setNumSongs(item.n_songs);
              }
            }}
          />
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
          {formState.mode === "Edit" ? (
            <>
              <button
                type="button"
                className={
                  GRID_BUTTON_CLASSES +
                  " flex-1 bg-danger-red text-white disabled:opacity-50 " +
                  "disabled:cursor-not-allowed"
                }
                onClick={handleMusicPanelDeleteBlock}
              >
                <Trash2 className="inline-block" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                className={
                  GRID_BUTTON_CLASSES +
                  " flex-1 bg-secondary-blue text-white disabled:opacity-50 " +
                  "disabled:cursor-not-allowed"
                }
                disabled={selectedPlaylistId === undefined}
                onClick={handleUpdateMusicBlock}
              >
                <SquareCheck className="inline-block" />
                <span>Update</span>
              </button>
            </>
          ) : (
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
          )}
        </div>
      </div>
    );
  }
}
