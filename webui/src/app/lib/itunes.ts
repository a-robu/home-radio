"use server";
import "server-only";

type ItunesPodcast = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  feedUrl: string;
};

export async function searchPodcasts(term: string) {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", "podcast");
  url.searchParams.set("limit", "25");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results as ItunesPodcast[];
}
