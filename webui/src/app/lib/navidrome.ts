"use server";
import "server-only";

import crypto from "crypto";

function getEnvOrError(name: string, required = true): string | undefined {
  const v = process.env[name];
  if (required && !v) {
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

function addNavidromeParams(url: URL) {
  const username = getEnvOrError("NAVIDROME_USERNAME") as string;
  const password = getEnvOrError("NAVIDROME_PASSWORD") as string;

  // Token auth per Subsonic spec: t = md5(password + salt), s = salt
  const salt = Math.random().toString(36).slice(2, 10);
  const token = crypto
    .createHash("md5")
    .update(password + salt)
    .digest("hex");

  url.searchParams.set("u", username);
  url.searchParams.set("t", token);
  url.searchParams.set("s", salt);
  url.searchParams.set("v", "1.16.1");
  url.searchParams.set("c", "home-radio");
  url.searchParams.set("f", "json");
}

export type NavidromePlaylist = {
  id: string;
  name: string;
  comment: string;
  songCount: number;
  duration: number;
  public: boolean;
  owner: string;
  created: string;
  changed: string;
  coverArt: string;
};

export async function getPlaylists(): Promise<NavidromePlaylist[]> {
  const baseUrl = getEnvOrError("NAVIDROME_BASE_URL") as string;
  const url = new URL("/rest/getPlaylists.view", baseUrl);
  addNavidromeParams(url);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const playlists = data["subsonic-response"]?.playlists?.playlist ?? [];
  return playlists as NavidromePlaylist[];
}

export async function getCoverArt(
  coverArtId: string,
  size: number | undefined
) {
  const baseUrl = getEnvOrError("NAVIDROME_BASE_URL") as string;
  const url = new URL("/rest/getCoverArt.view", baseUrl);
  addNavidromeParams(url);
  url.searchParams.set("id", coverArtId);
  if (size !== undefined) {
    url.searchParams.set("size", size.toString());
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return blob.arrayBuffer();
}
