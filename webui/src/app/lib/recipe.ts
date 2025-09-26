import { AudioWaveform, Mic, Music, Radio } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export type WithID<T> = {
  // dnd-kit looks for a property named "id"
  id: string;
  item: T;
};

export function withID(item: RecipeItem): WithID<RecipeItem> {
  return { id: uuidv4(), item };
}

export type PlaylistInfo = {
  id: string;
  name: string;
  cover_art: string;
};

export type SongsBlock = {
  playlist: PlaylistInfo;
  n_songs: number;
};

type PodcastBlock = {
  podcast_name: string;
  backup_podcast_name: string;
};

type RadioStationBlock = {
  station_name: string;
};

type CaddyFileBlock = {
  url: string;
  strategy: "file" | "cycle";
};

// Discriminated union for all recipe items
export type RecipeItem =
  | ({ type: "songs" } & SongsBlock)
  | ({ type: "podcast" } & PodcastBlock)
  | ({ type: "radio" } & RadioStationBlock)
  | ({ type: "caddy" } & CaddyFileBlock);

export const ICONS = {
  songs: Music,
  podcast: Mic,
  radio: Radio,
  caddy: AudioWaveform,
};
