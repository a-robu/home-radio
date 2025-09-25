import { getPlaylists } from "@/app/lib/navidrome";

export async function GET() {
  const playlists = await getPlaylists();
  return new Response(JSON.stringify(playlists), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
