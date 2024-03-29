import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: vercel({
    // by default, this caches for the duration of the deployment.
    // in production, you'd want to use mux webhooks to notify your deployment
    // that something's changed and it should invalidate the cache.
    isr: true,
    // oembed api relies on query params, so must be dynamic
    exclude: ["/api/oembed"],
  }),
});
