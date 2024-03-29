import client from "./mux";

export default async function getVideo(assetId: string) {
  const asset = await client.video.assets.retrieve(assetId);

  // get info out of video
  const playbackId = asset.playback_ids?.find(
    (id) => id.policy === "public"
  )?.id;
  const videoTrack = asset.tracks?.find((track) => track.type === "video");
  const createdAt = asset.created_at;
  const duration = asset.duration;
  const width = videoTrack?.max_width;
  const height = videoTrack?.max_height;
  return {
    playbackId,
    createdAt,
    duration,
    width,
    height,
  };
}
