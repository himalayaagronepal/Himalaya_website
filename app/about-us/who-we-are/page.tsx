// This route mirrors /about. `export { default } from` re-exports ONLY the
// component — it does NOT carry over route segment config like `dynamic`.
// Without re-declaring `force-dynamic` here, Next.js tries to statically
// prerender this page during `next build`, which opens a MongoDB connection
// at build time and hangs (60s timeout) on Vercel, failing the whole build.
export { default, metadata } from "../../about/page";

export const dynamic = "force-dynamic";
