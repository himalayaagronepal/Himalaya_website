'use client';

import BackgroundVideo, { VideoSource } from '../BackgroundVideo';

// Primary delivery: Cloudinary (cloud dk7ggjvlw) serves the "hariyali" master
// from a global media CDN with range requests + edge caching. We hand the
// browser two sources, best-first:
//   1. VP9/webm at q_auto:best — Chrome/Firefox/Edge/Android. ~62 MB / 3.7 Mbps,
//      visually ~equal to a 5.5–6 Mbps H.264, so it looks near-master yet streams
//      without buffering.
//   2. H.264/mp4 at q_auto:good — Safari/iOS that can't take VP9. ~55 MB.
// c_limit,w_1920 caps both to the source's native 1080p.
const cloudSources: VideoSource[] = [
  {
    src: 'https://res.cloudinary.com/dk7ggjvlw/video/upload/f_webm,vc_vp9,q_auto:best,c_limit,w_1920/hariyali_farms.webm',
    type: 'video/webm',
  },
  {
    src: 'https://res.cloudinary.com/dk7ggjvlw/video/upload/f_mp4,q_auto:good,c_limit,w_1920/hariyali_farms.mp4',
    type: 'video/mp4',
  },
];

// Last resort: self-hosted /public file, used only if the Cloudinary CDN fails.
// Versioned (_v1) because /public assets are cached 1-year immutable — a new
// filename is what actually delivers a re-encode to returning visitors.
const localSrc = '/hariyali_farms_opt_v1.mp4';

const poster = '/hariyali_farms_poster_v1.jpg';

/**
 * Background video for the /farms hero. See BackgroundVideo for the
 * poster-first, attach-after-mount, CDN-with-fallback behavior.
 */
export default function FarmsHeroVideo() {
  return <BackgroundVideo cloudSources={cloudSources} localSrc={localSrc} poster={poster} />;
}
