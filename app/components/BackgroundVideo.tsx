'use client';

import { useEffect, useRef, useState } from 'react';

export type VideoSource = { src: string; type: string };

export type BackgroundVideoProps = {
  /**
   * Primary CDN sources in preference order. The browser plays the first type
   * it supports — typically VP9/webm (Chrome, Firefox, Edge, Android) with an
   * H.264/mp4 fallback (Safari/iOS). VP9 delivers the same visible quality as
   * H.264 at roughly two-thirds the bytes, so quality stays high and nothing
   * buffers.
   */
  cloudSources: VideoSource[];
  /** Self-hosted /public mp4, used only if every CDN source fails to load. */
  localSrc: string;
  /** Poster image (rendered immediately; doubles as the LCP / no-JS visual). */
  poster: string;
  className?: string;
};

/**
 * Reusable autoplay background video for hero/banner sections.
 *
 * The poster is always rendered, so the section looks complete instantly with no
 * black/blank flash. The video is attached only after mount, and only on larger
 * screens where motion is allowed — so it never blocks first paint, and small
 * screens / reduced-motion users get the poster alone to save data and battery.
 *
 * Delivery is Cloudinary-first (global CDN, range requests, VP9-then-H.264) with
 * a self-hosted /public fallback, so production stays smooth and buffer-free
 * without compromising visible quality.
 */
export default function BackgroundVideo({
  cloudSources,
  localSrc,
  poster,
  className = 'absolute inset-0 h-full w-full object-cover',
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const largeScreen = window.matchMedia('(min-width: 768px)').matches;
    if (!reducedMotion && largeScreen) setEnabled(true);
  }, []);

  // When the source set changes, the element needs an explicit load()/play() to
  // pick it up and begin autoplaying over the poster.
  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const played = video.play();
    if (played) played.catch(() => {});
  }, [enabled, useFallback]);

  // A <video> never fails over on a network/load error on its own. If every
  // Cloudinary source fails to load, swap to the self-hosted /public file.
  const handleError = () => {
    if (!useFallback) setUseFallback(true);
  };

  const sources: VideoSource[] = useFallback
    ? [{ src: localSrc, type: 'video/mp4' }]
    : cloudSources;

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload={enabled ? 'auto' : 'none'}
      onError={handleError}
      aria-hidden="true"
      tabIndex={-1}
    >
      {enabled &&
        sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
    </video>
  );
}
