import { searchPodcasts } from "@/app/lib/itunes";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("q");
  if (!term) {
    return new Response(JSON.stringify({ error: "Missing 'q' parameter" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const playlists = await searchPodcasts(term);
  return new Response(JSON.stringify(playlists), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
