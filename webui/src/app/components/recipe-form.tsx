"use client";

import { useEffect, useMemo, useState } from "react";
import type { RecipeItem } from "@/app/lib/recipe";
import { ICONS } from "@/app/lib/recipe";
import SongForm from "@/app/components/song-form";
import { SquareCheck, SquarePlus, Trash2, Undo } from "lucide-react";

export type RecipeFormSubject =
  | { mode: "Add"; itemType: RecipeItem["type"] }
  | { mode: "Edit"; item: RecipeItem };

export type RecipeFormProps = {
  subject: RecipeFormSubject;
  onCancel: () => void;
  onDelete?: () => void;
  onSave: (item: RecipeItem) => void;
};

const GRID_BUTTON_CLASSES =
  "flex justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-sm select-none";

export default function RecipeForm({
  subject,
  onCancel,
  onDelete,
  onSave,
}: RecipeFormProps) {
  const [validItem, setValidItem] = useState<RecipeItem | null>(null);

  const itemType =
    subject.mode === "Edit" ? subject.item.type : subject.itemType;

  const header = useMemo(() => {
    const Icon = ICONS[itemType];
    const label = {
      songs: "Navidrome",
      podcast: "Podcast",
      radio: "Radio",
      caddy: "Caddy File",
    }[itemType];
    return (
      <p className="flex justify-center text-white bg-black/40 p-3">
        <Icon className="inline-block" />
        <span className="ml-1">
          {subject.mode === "Edit" ? "Editing " : "Adding "} {label} Block
        </span>
      </p>
    );
  }, [subject.mode]);

  const renderChildForm = () => {
    if (itemType === "songs") {
      return (
        <SongForm
          prefill={
            subject.mode === "Edit" && subject.item.type === "songs"
              ? subject.item
              : null
          }
          onValidChange={setValidItem}
        />
      );
    }

    // TODO: add forms for other types
    return (
      <div className="text-white p-3">
        This block type is not implemented yet.
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {header}
      {renderChildForm()}

      <div className="flex gap-3 m-3 mt-auto">
        <button
          type="button"
          className={
            GRID_BUTTON_CLASSES +
            " flex-1 bg-black/35 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          }
          onClick={onCancel}
        >
          <Undo className="inline-block" />
          <span>Cancel</span>
        </button>

        {subject.mode === "Edit" ? (
          <>
            <button
              type="button"
              className={
                GRID_BUTTON_CLASSES +
                " flex-1 bg-caution-orange text-white disabled:opacity-50 " +
                "disabled:cursor-not-allowed"
              }
              onClick={onDelete}
            >
              <Trash2 className="inline-block" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              className={
                GRID_BUTTON_CLASSES +
                " flex-1 bg-secondary-blue text-white disabled:opacity-50 disabled:cursor-not-allowed"
              }
              disabled={validItem === null}
              onClick={() => validItem && onSave(validItem)}
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
              " flex-1 bg-secondary-blue text-white disabled:opacity-50 disabled:cursor-not-allowed"
            }
            disabled={validItem === null}
            onClick={() => validItem && onSave(validItem)}
          >
            <SquarePlus className="inline-block" />
            <span>Add Block</span>
          </button>
        )}
      </div>
    </div>
  );
}
