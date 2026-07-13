"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";

const DEFAULT_CONTENT_HTML = "<p>Welcome to Himalaya Nepal Agriculture Company Limited. It is with great pride and responsibility that I extend my warm greetings to all our valued farmers, partners, investors, customers, and well-wishers. Agriculture has always been the backbone of Nepal's economy, and we strongly believe that modern, sustainable, and technology-driven agriculture is the key to national prosperity and rural transformation.</p><p>Our company was established with a vision to create an integrated and diversified business ecosystem that supports agriculture, livestock farming, poultry, dairy, fisheries, goat and buffalo farming, agro-processing, hospitality services, and clean energy infrastructure under one progressive platform. Alongside agricultural development, we are also committed to promoting sustainable transportation and modern highway services through the development of EV charging stations and family-friendly modern restaurants and mini marts designed to serve travelers with comfort, safety, and quality service.</p><p>At Himalaya Nepal Agriculture Company Limited, we aim not only to produce quality agricultural products but also to create employment opportunities, strengthen local economies, encourage green energy adoption, and improve customer experiences through innovation and responsible business practices. We believe that collaboration, transparency, sustainability, and long-term vision are essential to building a stronger and more self-reliant Nepal.</p><p>As Chairperson, I remain deeply committed to ensuring that our organization contributes meaningfully to Nepal's agricultural modernization while embracing environmentally responsible technologies and diversified business opportunities for the future. Our mission is to bridge traditional values with modern solutions that benefit farmers, communities, travelers, and the nation as a whole.</p><p>I sincerely thank everyone who continues to support and believe in our vision and mission. Together, we can build a prosperous, sustainable, and forward-looking Nepal.</p>";

type Props = {
  name?: string;
  role?: string;
  subRole?: string;
  cardTitle?: string;
  image?: string;
  contentHtml?: string;
};

export default function MessageFromChairwoman({
  name = "Prof. Dr. Chandika Pandit",
  role = "Chairperson",
  subRole = "OB/GYN · Gandaki Medical College · Co-founder, Fewa City Hospital",
  cardTitle = "Chairperson",
  image = "/chandika_pandit.jpeg",
  contentHtml = DEFAULT_CONTENT_HTML,
}: Props) {
  const cardName = name;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const check = () => {
      // If maxHeight is applied (when not expanded), compare scrollHeight to clientHeight
      const max = 360; // matches inline style
      const overflowing = node.scrollHeight > max + 2;
      setIsOverflowing(overflowing);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(node);
    window.addEventListener("resize", check, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [contentRef]);

  return (
    <section style={{ marginTop: '30px', marginBottom: '30px' }} className="overflow-hidden bg-transparent px-4 py-3 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-[1650px]" ref={sectionRef}>
        <div className="flex flex-col lg:flex-row lg:items-start">

          {/* Left panel — portrait + name plate */}
          <div
            style={{
              transition: "transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.4s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: visible ? "translateX(0)" : "translateX(-10vw)",
              opacity: visible ? 1 : 0,
            }}
            className="relative lg:w-2/5 border border-slate-200 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none overflow-hidden bg-slate-100 flex flex-col self-start h-[420px] sm:h-[560px] md:h-[620px] lg:h-[737.21px] max-h-[85dvh]"
          >
            <div className="relative h-full w-full overflow-hidden">
              {!imageError ? (
                <img
                  src={image}
                  alt={name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-200 text-slate-400 w-full">
                  Portrait Placeholder
                </div>
              )}
              {/* Name plate */}
              <div className="absolute inset-x-0 bottom-0 bg-emerald-700/95 py-4 sm:py-5 text-center text-white">
                <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight">
                  {cardTitle}
                </h3>
                <p className="mt-1 text-base sm:text-lg font-semibold tracking-tight">
                  {cardName}
                </p>
                <p className="mt-2 text-xs sm:text-sm tracking-wide text-white/90 px-4">
                  {subRole}
                </p>
              </div>
            </div>
          </div>

          {/* Right panel — message */}
          <article
            style={{
              transition: "transform 2.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 2.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
              transform: visible ? "translateX(0)" : "translateX(10vw)",
              opacity: visible ? 1 : 0,
            }}
            className={`flex flex-col justify-center lg:w-3/5 bg-white px-4 py-5 sm:px-6 md:px-8 md:py-6 border border-slate-200 border-t-0 lg:border-t lg:border-l-0 rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none min-w-0 ${
              expanded ? "lg:h-[737.21px] lg:max-h-[85dvh] lg:justify-start lg:overflow-hidden" : ""
            }`}
          >
            <SectionTitle title="Message From The Chairperson" className="mb-5" />

            <div
              className={`text-start font-sans text-[14px] sm:text-[14.5px] md:text-[15px] font-normal leading-relaxed text-gray-600 space-y-3.5 ${
                expanded ? "lg:flex lg:flex-col lg:flex-1 lg:min-h-0" : ""
              }`}
            >
              <div
                ref={contentRef}
                className={`letter-content transition-[max-height] duration-300 ease-out ${
                  expanded ? "lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2" : ""
                }`}
                style={expanded ? undefined : { maxHeight: 360, overflow: "hidden" }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {isOverflowing && (
                <div className="mt-2">
                  <button
                    onClick={() => setExpanded((s) => !s)}
                    className="text-emerald-700 hover:underline font-semibold"
                    aria-expanded={expanded}
                  >
                    {expanded ? "Read less" : "Read more"}
                  </button>
                </div>
              )}
            </div>

            {/* Signature + CTA */}
            <div className="mt-5">
              <div className="h-px w-28 bg-slate-200" />
              <p className="mt-2 font-sans text-xs italic text-slate-500">
                {name}{role ? `, ${role}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/about-us/who-we-are"
                  className="inline-block rounded-xl bg-emerald-700 px-6 py-2.5 font-sans text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-emerald-800 hover:scale-105"
                >
                  About Our Company
                </Link>
                <Link
                  href="/about-us/hear-from-md"
                  className="inline-block rounded-xl border border-emerald-700 px-6 py-2.5 font-sans text-sm font-semibold text-emerald-700 transition-all duration-300 ease-out hover:bg-emerald-50"
                >
                  Hear From the MD
                </Link>
              </div>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
