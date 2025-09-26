"use client";

import { useEffect, useState } from "react";
import RecipeList from "@/app/components/recipe-list";
import { Eraser, Save } from "lucide-react";
import { ICONS, RecipeItem, withID, WithID } from "@/app/lib/recipe";
import RecipeForm from "@/app/components/recipe-form";

type PageState =
  | { mode: "ListView" }
  | { mode: "Add"; itemType: RecipeItem["type"] }
  | { mode: "Edit"; itemId: string };

const GRID_BUTTON_CLASSES =
  "flex justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-sm select-none";

export default function Page() {
  const initialItems: WithID<RecipeItem>[] = [
    withID({
      type: "songs",
      playlist: {
        id: "1",
        name: "My Favorite Songs",
        cover_art: "/default-cover.png",
      },
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

  const [pageState, setPageState] = useState<PageState>({ mode: "ListView" });
  const [items, setItems] = useState(initialItems);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const filteredInitial = initialItems.map(({ item }) => item);
    const filteredNew = items.map(({ item }) => item);
    setHasChanges(
      // TODO use a better deep equality check
      !(JSON.stringify(filteredInitial) === JSON.stringify(filteredNew))
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
    setItems(initialItems);
    setHasChanges(false);
  };

  const handleSave = () => {
    console.log("Mock handleSave:", items);
  };

  // Handlers that integrate with RecipeForm
  const handleAddItem = (item: RecipeItem) => {
    setItems((prev) => [...prev, withID(item)]);
  };
  const handleUpdateItem = (itemId: string, updatedItem: RecipeItem) => {
    setItems((prev) => {
      const next = [...prev];
      const itemIndex = next.findIndex((x) => x.id === itemId);
      next[itemIndex] = { ...next[itemIndex], item: updatedItem };
      return next;
    });
  };
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Child form components fetch their own data; nothing to preload here.

  if (pageState.mode === "ListView") {
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
              setPageState({ mode: "Edit", itemId: id });
            }}
          />
          <div className="grid grid-cols-2 gap-3 p-3 bg-relaxing-blue">
            <button
              className={GRID_BUTTON_CLASSES + " bg-black/15 text-white"}
              onClick={() => setPageState({ mode: "Add", itemType: "songs" })}
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
      <RecipeForm
        subject={
          pageState.mode === "Add"
            ? { mode: "Add", itemType: pageState.itemType }
            : {
                mode: "Edit",
                item: items.find((i) => i.id === pageState.itemId)!.item,
              }
        }
        onCancel={() => setPageState({ mode: "ListView" })}
        onDelete={
          pageState.mode === "Edit"
            ? () => {
                handleDeleteItem(pageState.itemId);
                setPageState({ mode: "ListView" });
              }
            : undefined
        }
        onSave={(newItem) => {
          pageState.mode === "Add"
            ? handleAddItem(newItem)
            : handleUpdateItem(pageState.itemId, newItem);
          setPageState({ mode: "ListView" });
        }}
      />
    );
  }
}
