'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, EffectFade, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export type GalleryImage = { src: string; alt?: string; caption?: string; mediaType?: 'image' | 'video' };

type Props = {
  images: GalleryImage[];
  /** Autoplay interval in ms. Set to 0 to disable. */
  interval?: number;
};

/**
 * Modern gallery carousel — large rounded card, smooth fade
 * transitions, Ken-Burns zoom on the active slide, thumbnail strip
 * (md+), arrow + keyboard navigation, and a full-screen lightbox.
 */
export default function GalleryCarousel({ images, interval = 5000 }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);
  const mainVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lightboxVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Swiper's fade effect keeps every slide mounted, so videos must be
  // played/paused imperatively when the active slide changes.
  useEffect(() => {
    mainVideoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && !lightboxOpen) {
        v.currentTime = 0;
        v.play().catch(() => {
          // Playback blocked: don't hold the carousel on a frozen frame.
          if (interval && interval > 0) swiperRef.current?.autoplay?.start();
        });
      } else {
        v.pause();
      }
    });
  }, [active, lightboxOpen, images, interval]);

  // Hold the carousel while a video slide is showing (it advances itself on
  // `ended`) and while the lightbox is open, so the timer doesn't cut the
  // video off or drag the lightbox to another slide.
  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay || !interval || interval <= 0) return;
    if (lightboxOpen || images[active]?.mediaType === 'video') {
      autoplay.stop();
    } else {
      autoplay.start();
    }
  }, [active, lightboxOpen, images, interval]);

  useEffect(() => {
    lightboxVideoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (lightboxOpen && i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, lightboxOpen, images]);

  const openLightbox = (index?: number) => {
    if (typeof index === 'number') setActive(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen && lightboxSwiperRef.current) {
      lightboxSwiperRef.current.slideTo(active, 0);
    }
  }, [lightboxOpen, active]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative">
      {/* ── Main carousel card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] bg-emerald-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination, Keyboard]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActive(s.realIndex)}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          // `rewind` instead of `loop`: loop mode reorders slide DOM nodes
          // (loopFix), and moving a playing <video> element pauses it.
          rewind={images.length > 1}
          speed={900}
          autoplay={
            interval && interval > 0
              ? { delay: interval, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          keyboard={{ enabled: true }}
          pagination={{
            clickable: true,
            el: '.gallery-pagination',
          }}
          navigation={{
            prevEl: '.gallery-prev',
            nextEl: '.gallery-next',
          }}
          className="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] w-full"
        >
          {images.map((img, i) => (
            <SwiperSlide key={`${img.src}-${i}`}>
              <button
                type="button"
                onClick={() => openLightbox(i)}
                className="group relative block h-full w-full cursor-zoom-in focus:outline-none"
                aria-label={`Open ${img.mediaType === 'video' ? 'video' : 'photo'} ${i + 1} in fullscreen`}
              >
                {img.mediaType === 'video' ? (
                  <video
                    ref={(el) => { mainVideoRefs.current[i] = el; }}
                    src={img.src}
                    muted
                    loop={images.length === 1}
                    playsInline
                    preload="auto"
                    onEnded={() => swiperRef.current?.slideNext()}
                    onPause={(e) => {
                      // Self-heal: if anything other than us pauses the
                      // active video (e.g. Swiper moving DOM nodes), resume.
                      const v = e.currentTarget;
                      if (i === active && !lightboxOpen && !v.ended) {
                        v.play().catch(() => {});
                      }
                    }}
                    onError={() => {
                      if (interval && interval > 0) swiperRef.current?.autoplay?.start();
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={img.src}
                      alt={img.alt ?? `Gallery photo ${i + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Ken-Burns zoom on the active slide (images only) */}
                    <motion.div
                      key={`zoom-${active}-${i}`}
                      initial={{ scale: 1.0 }}
                      animate={{ scale: active === i ? 1.06 : 1.0 }}
                      transition={{ duration: 6, ease: 'easeOut' }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${img.src}')` }}
                    />
                  </>
                )}
                {/* Soft bottom gradient for caption legibility */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 px-6 py-5 sm:px-8 sm:py-6">
                    <p className="max-w-2xl text-sm sm:text-base font-medium text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                      {img.caption}
                    </p>
                  </div>
                )}
                {/* Expand affordance on hover */}
                <div className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                  <Expand size={18} />
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Arrow buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-prev absolute left-3 sm:left-5 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/85 text-emerald-900 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="gallery-next absolute right-3 sm:right-5 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/85 text-emerald-900 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slide counter */}
        <div className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5 rounded-full bg-black/45 px-3 py-1 text-[11px] sm:text-xs font-semibold text-white/90 backdrop-blur-sm">
          {String(active + 1).padStart(2, '0')}{' '}
          <span className="text-white/55">/ {String(images.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Pagination dots below the card */}
      <div className="gallery-pagination mt-6 flex items-center justify-center gap-2" />

      {/* Thumbnail strip — visible from md upward */}
      {images.length > 1 && (
        <div className="mt-6 hidden md:flex items-center justify-center gap-3 flex-wrap">
          {images.map((img, i) => (
            <button
              key={`thumb-${img.src}-${i}`}
              type="button"
              onClick={() => swiperRef.current?.slideTo(i)}
              aria-label={`Go to ${img.mediaType === 'video' ? 'video' : 'photo'} ${i + 1}`}
              className={`relative h-16 w-24 lg:h-[72px] lg:w-28 overflow-hidden rounded-lg transition-all duration-300 ${
                active === i
                  ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-white scale-105'
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              {img.mediaType === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-80">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              ) : (
                <img
                  src={img.src}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close fullscreen"
              className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={22} />
            </button>

            <div className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
              {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>

            <div
              className="relative w-full max-w-[1400px] px-4 sm:px-12 lg:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Swiper
                modules={[Navigation, Keyboard, EffectFade]}
                onSwiper={(s) => (lightboxSwiperRef.current = s)}
                onSlideChange={(s) => setActive(s.realIndex)}
                initialSlide={active}
                rewind={images.length > 1}
                speed={500}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                keyboard={{ enabled: true }}
                navigation={{
                  prevEl: '.lightbox-prev',
                  nextEl: '.lightbox-next',
                }}
                className="!overflow-visible"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={`lb-${img.src}-${i}`}>
                    <motion.div
                      key={`lb-frame-${i}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      {img.mediaType === 'video' ? (
                        <video
                          ref={(el) => { lightboxVideoRefs.current[i] = el; }}
                          src={img.src}
                          controls
                          playsInline
                          className="max-h-[85vh] w-auto max-w-full rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                        />
                      ) : (
                        <img
                          src={img.src}
                          alt={img.alt ?? `Photo ${i + 1}`}
                          className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                        />
                      )}
                    </motion.div>
                    {img.caption && (
                      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-white/75">
                        {img.caption}
                      </p>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="lightbox-prev absolute left-0 sm:-left-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="lightbox-next absolute right-0 sm:-right-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
