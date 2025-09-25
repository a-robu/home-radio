import { getCoverArt } from "@/app/lib/navidrome";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coverArtId = searchParams.get("id");
  if (!coverArtId) {
    return new Response("Missing cover art ID", { status: 400 });
  }
  const sizeParam = searchParams.get("size");

  const coverArt = await getCoverArt(
    coverArtId,
    sizeParam ? parseInt(sizeParam) : undefined
  );
  return new Response(coverArt, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
}
