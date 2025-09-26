import { useSortable } from "@dnd-kit/sortable";
import { ICONS, RecipeItem } from "../lib/recipe";
import { GripVertical, Settings } from "lucide-react";

export default function RecipeListItem({
  item,
  sortableId,
  onSettingsClick,
}: {
  item: RecipeItem;
  sortableId: string;
  onSettingsClick: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: sortableId });
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
      style={style}
      className={
        "flex justify-start items-center rounded-sm gap-1.5 bg-black/15 text-white " +
        "select-none "
      }
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center cursor-grab active:cursor-grabbing  p-2 flex-1"
      >
        <div className="p-1" aria-label="Drag handle">
          <GripVertical className="touch-manipulation" />
        </div>
        <ItemIcon className="inline-block" />
        <div className="flex flex-col ml-2">
          <span className="font-semibold">{itemLines[0]}</span>
          <span className="text-sm text-white/70">{itemLines[1]}</span>
        </div>
      </div>
      <button
        className="p-2 m-2 rounded bg-white/10 cursor-pointer"
        onClick={onSettingsClick}
        aria-label="Edit"
      >
        <Settings />
      </button>
    </div>
  );
}
