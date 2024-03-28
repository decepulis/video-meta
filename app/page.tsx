import { Metadata } from "next";
import { WithContext, VideoObject } from "schema-dts";
import { formatISODuration } from "date-fns";
import Mux from "@mux/mux-node";
import MuxPlayer from "./MuxPlayer.client";

const ASSET_ID = "E7eGhQbCaS00O0200d1fx2B101gTHu1G400kF83jxgT9KirI";

const mux = new Mux({ fetch });

const getVideo = async () => {
  const asset = await mux.video.assets.retrieve(ASSET_ID);
  const playbackId = asset.playback_ids?.find((id) => id.policy === "public");
  const videoTrack = asset.tracks?.find((track) => track.type === "video");
  return {
    createdAt: asset.created_at,
    duration: asset.duration,
    playbackId: playbackId?.id,
    videoTrack,
  };
};

const title = "Disco Dogs";
const description = "What if dogs, but disco?";

export async function generateMetadata(): Promise<Metadata> {
  const { playbackId, videoTrack } = await getVideo();
  return {
    title, // <title />
    description, // <meta name="description" />
    authors: [
      { name: "Darius Cepulis", url: "https://x.com/darius_cepulis" }, // <meta name="author" /> <link rel="author" />
      { name: "Matt McClure", url: "https://x.com/matt_mcclure" },
    ],
    keywords: ["dogs", "disco", "dance", "party"], // <meta name="keywords" />
    openGraph: {
      url: "/", // <og:url />
      title, // <og:title />
      description, // <og:description />
      type: "video.movie", // <og:type />
      // <og:image />
      images: [
        {
          url: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&height=630`,
          secureUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&height=630`,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Disco Dogs",
        },
      ],
      // <og:video />
      videos: [
        {
          url: `https://stream.mux.com/${playbackId}/high.mp4`,
          type: "video/mp4",
          width: videoTrack?.max_width,
          height: videoTrack?.max_height,
        },
      ],
    },
    twitter: {
      title, // <twitter:title />
      description, // <twitter:description />
      card: "summary_large_image", // <twitter:card />
      images: {
        // <twitter:image />
        url: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&height=600`,
        width: 1200,
        height: 600,
        alt: "Disco Dogs",
      },
      // twitter: {
      //   title, // <twitter:title />
      //   description, // <twitter:description />
      //   card: "player", // <twitter:card />
      //   players: [
      //     {
      //       // <twitter:player />
      //       playerUrl: 'todo iframe',
      //       streamUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      //       width: videoTrack?.max_width ?? 1280,
      //       height: videoTrack?.max_height ?? 720,
      //     },
      //   ],
    },
  };
}

export default async function Home() {
  const { playbackId, videoTrack, createdAt, duration } = await getVideo();

  const videoObject: WithContext<VideoObject> = {
    // required
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
    uploadDate: new Date(parseInt(createdAt, 10) * 1000).toISOString(),
    // optional
    description,
    contentUrl: `https://stream.mux.com/${playbackId}.m3u8`,
    duration: formatISODuration({ seconds: duration }),
    // todo: we can add more. See typescript type
  };

  return (
    <main className="p-4 w-full max-w-2xl mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Video Meta Tags</h1>
      <MuxPlayer
        playbackId={playbackId}
        className="w-full"
        style={{
          aspectRatio:
            videoTrack?.max_height && videoTrack?.max_width
              ? videoTrack.max_width / videoTrack.max_height
              : undefined,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObject) }}
      />
    </main>
  );
}
