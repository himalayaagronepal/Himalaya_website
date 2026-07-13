/**
 * Rewrites a Cloudinary video delivery URL to a browser-safe rendition.
 *
 * Originals uploaded from phones can fail to decode in desktop browsers
 * (observed: Chrome stops with MEDIA_ERR_DECODE a few seconds in). The
 * injected transformation makes Cloudinary transcode to H.264/AAC MP4,
 * capped at 1080p with automatic quality — which also shrinks delivery
 * size dramatically. Safe to call on non-Cloudinary or already-rewritten
 * URLs (returned unchanged). Pure string helper, usable on client and server.
 */
export const VIDEO_TRANSFORMATION = "f_mp4,vc_h264,ac_aac,q_auto,h_1080,c_limit";

export function browserSafeVideoUrl(url: string): string {
  if (!url || !url.includes("/video/upload/") || url.includes(VIDEO_TRANSFORMATION)) {
    return url;
  }
  return url.replace("/video/upload/", `/video/upload/${VIDEO_TRANSFORMATION}/`);
}
