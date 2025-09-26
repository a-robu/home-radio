"use client";

import { useEffect, useState } from "react";
import type { RecipeItem, SongsBlock } from "@/app/lib/recipe";
import type { MakeNullable } from "@/app/lib/type-utils";
import { Minus, Plus } from "lucide-react";
import { getPlaylists, NavidromePlaylist } from "../lib/navidrome";

type DraftSongsBlock = MakeNullable<SongsBlock, "playlist">;

const SONG_BLOCK_DEFAULTS: DraftSongsBlock = {
  playlist: null,
  n_songs: 1,
};

export type SongFormProps = {
  /* Prepopulate form if editing otherwise will infer defaults */
  prefill: SongsBlock | null;
  /* Either a valid RecipeItem or null if the form is incomplete/invalid */
  onValidChange: (validItem: RecipeItem | null) => void;
};

export default function SongForm({ prefill, onValidChange }: SongFormProps) {
  const [fetchedPlaylists, setFetchedPlaylists] = useState<
    NavidromePlaylist[] | undefined
  >(undefined);
  const [current, setCurrent] = useState(SONG_BLOCK_DEFAULTS);

  useEffect(() => {
    (async () => {
      setFetchedPlaylists(await getPlaylists());
    })();
  }, []);

  // Refill form if the prefill changes
  useEffect(() => {
    if (prefill === null) {
      setCurrent(SONG_BLOCK_DEFAULTS);
    } else {
      setCurrent(prefill);
    }
  }, [prefill]);

  function handlePlaylistChange(ndPlaylist: NavidromePlaylist) {
    setCurrent((curr) => ({
      ...curr,
      playlist: {
        id: ndPlaylist.id,
        name: ndPlaylist.name,
        cover_art: ndPlaylist.coverArt,
      },
    }));
  }

  function handleNumSongsChange(amount: number) {
    setCurrent((curr) => ({
      ...curr,
      n_songs: Math.max(1, (curr.n_songs ?? 1) + amount),
    }));
  }

  useEffect(() => {
    if (current.playlist !== null && current.n_songs >= 1) {
      onValidChange({
        type: "songs",
        ...(current as SongsBlock),
      });
    } else {
      onValidChange(null);
    }
  }, [current]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-white p-3">Choose which playlist to play from:</p>
      <div className="px-3">
        {fetchedPlaylists === undefined && (
          <p className="text-white/70">Loading playlists...</p>
        )}
        {fetchedPlaylists !== undefined && fetchedPlaylists.length === 0 && (
          <p className="text-white/70">No playlists found.</p>
        )}
        {fetchedPlaylists !== undefined && fetchedPlaylists.length > 0 && (
          <div role="radiogroup" aria-label="Navidrome playlists">
            {fetchedPlaylists.map((pl) => (
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
                  onChange={() => handlePlaylistChange(pl)}
                  checked={current.playlist?.id === pl.id}
                />
                <span className="w-5 h-5 inline-grid place-items-center rounded-full border-2 border-white/70 peer-checked:border-white">
                  <span
                    className="w-3 h-3 rounded-full bg-white"
                    style={{
                      display:
                        current.playlist?.id === pl.id ? "initial" : "none",
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
          type="button"
          className="p-2 bg-black/20 text-white rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleNumSongsChange(-1)}
          disabled={current.n_songs <= 1}
          aria-label="Decrease number of songs"
        >
          <Minus />
        </button>
        <input
          type="number"
          className="text-right w-20 bg-black/10 text-white p-2   border-white/20"
          value={current.n_songs}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            let parsedValue = 1;
            if (!Number.isNaN(val) && val >= 1) {
              parsedValue = val;
            }
            setCurrent((curr) => ({
              ...curr,
              n_songs: parsedValue,
            }));
          }}
          aria-label="Number of songs to play"
          min={1}
        />
        <button
          type="button"
          className="p-2 bg-black/20 text-white rounded-r"
          onClick={() => handleNumSongsChange(1)}
          aria-label="Increase number of songs"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}
