"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf01Icon, PolicyIcon, UserGroupIcon } from "hugeicons-react";

type Props = { imageSrc?: string };

const badgeItems = [
  { icon: UserGroupIcon, label: "Leadership" },
  { icon: Leaf01Icon, label: "Agriculture" },
  { icon: PolicyIcon, label: "Public Administration" },
];

export default function HeroSection({ imageSrc }: Props) {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-white py-8 sm:py-10 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full"
      >
        <div className="w-full">
          <div className="group w-full">
            <div className="grid gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(22rem,40rem)_1fr] lg:items-center xl:grid-cols-[minmax(24rem,44rem)_1fr] xl:px-10 xl:py-12">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex justify-center lg:justify-start"
              >
                <div className="relative aspect-square w-full max-w-[24rem] overflow-hidden rounded-full border-[14px] border-[#1C2B14]/10 bg-[#f6fbf4] shadow-[0_22px_60px_rgba(28,43,20,0.18)] transition-transform duration-300 ease-out group-hover:scale-[1.015] sm:max-w-[26rem] md:max-w-[28rem] lg:max-w-[32rem] xl:max-w-[34rem]">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt="Dolindra Prasad Sharma"
                      fill
                      sizes="(max-width: 640px) 384px, (max-width: 1024px) 448px, 544px"
                      className="object-cover object-top"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1C2B14] text-5xl font-black text-white md:text-6xl">
                      DPS
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
                className="space-y-4 text-center lg:text-left"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-3xl font-bold tracking-tight text-[#1C2B14] md:text-5xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Dolindra Prasad Sharma
                </motion.h1>

                <p className="text-sm font-semibold text-[#009F00] md:text-base">
                  Managing Director · Himalaya Nepal Krishi Company Limited
                </p>

                <p className="mx-auto max-w-3xl text-sm leading-7 text-gray-700 lg:mx-0 md:text-base">
                  Dolindra Prasad Sharma is a person with zealous spirit and winning contour to overcome unbeatable challenges and business hazards. He is endowed with patience and decorum required to affect the functionality of commercial and social organizations. He is a man of integrity and honesty for easing the complication level and beautifying the substantial shape of thoughts and visions by bringing about ideas to reality.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {badgeItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.08 * index }}
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#FA9121] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-slate-200 hover:text-slate-800 hover:shadow-[0_14px_35px_rgba(15,23,42,0.12)]"
                      >
                        <Icon size={18} strokeWidth={1.9} className="text-white transition-transform duration-300 group-hover:scale-110 group-hover:text-slate-700" />
                        <span>{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}