import type { APIRoute } from "astro";
import client from "../../lib/mux";
import getVideo from "../../lib/get-video";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // get playback-id from query
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  if (type !== "json") {
    return new Response(`Invalid type. Expected json. Got ${type}`, {
      status: 400,
    });
  }
  const url = searchParams.get("url");
  if (!url) {
    return new Response(`Missing url. Got ${url}`, { status: 400 });
  }

  // get the playback id from the url
  // ideally, we'd have a regex that would check for mux-video-meta.vercel.app/frame/PLAYBACK_ID
  // and extract PLAYBACK_ID from the url, but for demo purposes, let's just...
  const playbackId = url.split("/").pop() ?? "";

  // get video from playback id
  const { object } = await client.video.playbackIds.retrieve(playbackId);
  const assetId = object.id;
  const { width, height } = await getVideo(assetId);
  // in production, we'd want to check for a valid playback id, a valid asset response, etc.

  // return oembed as json
  return new Response(
    JSON.stringify({
      success: true,
      type: "video",
      version: "1.0",
      title: "Disco Dogs",
      html: /* html */ `<iframe src="https://mux-video-meta.vercel.app/frame/${playbackId}" style="aspect-ratio: ${width} / ${height};" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>`,
      width,
      height,
      thumbnail_url: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
      thumbnail_width: width,
      thumbnail_height: height,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
