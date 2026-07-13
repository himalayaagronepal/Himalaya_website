'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sprout, Factory, Zap, Coffee } from 'lucide-react';
import SectionTitle from './SectionTitle';

const pillars = [
  {
    title: 'Integrated Agriculture',
    description:
      'Poultry, dairy, buffalo, goat farming and organic crops — one farm-to-market platform across Nepal.',
    accent: '#059669',
    accentSoft: 'rgba(5,150,105,0.09)',
    glowGradient: 'radial-gradient(ellipse at 30% 0%, rgba(5,150,105,0.09) 0%, transparent 70%)',
    borderGradient:
      'linear-gradient(135deg, rgba(5,150,105,0.4), rgba(5,150,105,0.08) 60%, transparent)',
    icon: <Sprout width={24} height={24} className="w-6 h-6" />,
  },
  {
    title: 'Agro-Processing',
    description:
      'Modern processing and value addition for local produce — packaged to "Made in Nepal" quality standards.',
    accent: '#15803d',
    accentSoft: 'rgba(21,128,61,0.09)',
    glowGradient: 'radial-gradient(ellipse at 30% 0%, rgba(21,128,61,0.09) 0%, transparent 70%)',
    borderGradient:
      'linear-gradient(135deg, rgba(21,128,61,0.4), rgba(21,128,61,0.08) 60%, transparent)',
    icon: <Factory width={24} height={24} className="w-6 h-6" />,
  },
  {
    title: 'Clean Energy & EV',
    description:
      'EV charging stations and renewable energy infrastructure powering sustainable highway travel.',
    accent: '#047857',
    accentSoft: 'rgba(4,120,87,0.09)',
    glowGradient: 'radial-gradient(ellipse at 30% 0%, rgba(4,120,87,0.09) 0%, transparent 70%)',
    borderGradient:
      'linear-gradient(135deg, rgba(4,120,87,0.4), rgba(4,120,87,0.08) 60%, transparent)',
    icon: <Zap width={24} height={24} className="w-6 h-6" />,
  },
  {
    title: 'Hospitality & Tourism',
    description:
      'Family-friendly highway restaurants and agro-tourism experiences for travelers and communities.',
    accent: '#65a30d',
    accentSoft: 'rgba(101,163,13,0.09)',
    glowGradient: 'radial-gradient(ellipse at 30% 0%, rgba(101,163,13,0.09) 0%, transparent 70%)',
    borderGradient:
      'linear-gradient(135deg, rgba(101,163,13,0.4), rgba(101,163,13,0.08) 60%, transparent)',
    icon: <Coffee width={24} height={24} className="w-6 h-6" />,
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: 'easeOut' as const },
  },
};

/* ── Types ── */
interface PillarType {
  title: string;
  description: string;
  accent: string;
  accentSoft: string;
  glowGradient: string;
  borderGradient: string;
  icon: React.ReactNode;
}

/* ── Tilt Card ── */
function TiltCard({ pillar }: { pillar: PillarType }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState(false);
  const [shineX, setShineX] = useState(-60);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    setTilt({
      rx: ((y - cy) / cy) * -9,
      ry: ((x - cx) / cx) * 9,
    });
    setShineX((x / r.width) * 120 - 30);
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => !isMobile && setHovered(true), [isMobile]);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ rx: 0, ry: 0 });
    setShineX(-60);
  }, []);

  const handleTouchStart = useCallback(() => {
    setHovered(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isMobile
          ? hovered
            ? 'scale(1.02) translateY(-8px)'
            : 'scale(1) translateY(0px)'
          : hovered
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-10px) scale(1.025)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition: isMobile
          ? 'transform 0.3s cubic-bezier(0.22,1,0.36,1)'
          : hovered
          ? 'transform 0.08s linear'
          : 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'transform',
      }}
      className="relative rounded-2xl sm:rounded-[22px] overflow-hidden cursor-pointer select-none"
    >
      {/* Glass base */}
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-[22px]"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.88)',
          boxShadow: hovered
            ? `0 24px 56px rgba(0,0,0,0.13), 0 8px 24px ${pillar.accentSoft.replace('0.09', '0.18')}, inset 0 1px 0 rgba(255,255,255,0.95)`
            : '0 4px 24px rgba(46,125,50,0.10), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
          transition: 'box-shadow 0.45s ease',
        }}
      />

      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-[22px] pointer-events-none"
        style={{
          background: pillar.glowGradient,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Gradient border on hover */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: -1,
          borderRadius: isMobile ? 16 : 23,
          background: pillar.borderGradient,
          zIndex: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Shimmer sweep */}
      {!isMobile && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${shineX}%`,
            width: '40%',
            background:
              'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
            transform: 'skewX(-15deg)',
            transition: hovered ? 'left 0.08s linear' : 'left 0.6s ease',
            opacity: hovered ? 1 : 0,
          }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10 p-5 sm:p-7">
        {/* Icon ring */}
        <div
          className="mb-4 sm:mb-5 flex items-center justify-center rounded-xl sm:rounded-2xl"
          style={{
            width: isMobile ? 48 : 54,
            height: isMobile ? 48 : 54,
            background: pillar.accentSoft,
            color: pillar.accent,
            transform: hovered ? 'scale(1.13) rotate(-4deg)' : 'scale(1) rotate(0deg)',
            boxShadow: hovered
              ? `0 6px 20px ${pillar.accentSoft.replace('0.09', '0.25')}`
              : 'none',
            transition:
              'transform 0.38s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease',
          }}
        >
          {pillar.icon}
        </div>

        {/* Title */}
        <h3
          className="text-sm sm:text-[15.5px] font-bold text-gray-900 mb-2 tracking-tight leading-snug"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {pillar.title}
        </h3>

        {/* Animated accent line */}
        <div
          className="mb-3 rounded-full"
          style={{
            height: 2,
            width: hovered ? (isMobile ? 40 : 48) : (isMobile ? 24 : 28),
            background: pillar.accent,
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        />

        {/* Description */}
        <p className="text-xs sm:text-[12.5px] text-gray-500 leading-relaxed">
          {pillar.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Main Export ── */
export default function OurMission() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-scroll bg-center bg-cover bg-no-repeat py-12 sm:py-16 lg:py-[50px] md:bg-fixed"
      style={{ backgroundImage: "url('/background_for_mission.jpeg')" }}
    >
      {/* Slightly stronger overlay for consistent contrast */}
      <div className="absolute inset-0 bg-white/20" />

      {/* Decorative circles removed per design request */}

      <div className="relative z-10 mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <SectionTitle title="Transforming Nepal's Agriculture" className="mb-3 sm:mb-4" />

          {/* Prominent headline — makes this section visually pop on the page */}
          <motion.h3
            variants={headingVariants}
            className="mx-auto mt-4 max-w-4xl text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-emerald-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)] px-2"
          >
            One integrated platform for{' '}
            <span className="text-emerald-600">farming, energy & hospitality</span>
          </motion.h3>
          <motion.p
            variants={headingVariants}
            className="mx-auto mt-3 max-w-2xl text-center text-sm sm:text-base text-slate-600 leading-relaxed"
          >
            Bringing modern agriculture, clean-energy infrastructure, and family-friendly hospitality
            together under one progressive Nepalese platform.
          </motion.p>

          {/* Mission Statement — stronger contrast and subtle panel for legibility */}
          <div className="mx-auto max-w-3xl mb-10 sm:mb-12 sm:mb-16 px-2">
            {/* Invisible spacer only — panel/background removed */}
            <div className="px-4 py-4 sm:px-6 sm:py-6" aria-hidden="true">
              <div className="min-h-[0.75rem] sm:min-h-[1.25rem] lg:min-h-[1.5rem]" />
            </div>
          </div>

          {/* ── Mobile Cards (below sm) ── */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {pillars.map((pillar, index) => (
              <TiltCard key={index} pillar={pillar} />
            ))}
          </div>

          {/* ── Desktop / Tablet Cards (sm+) ── */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-4">
            {pillars.map((pillar, index) => (
              <TiltCard key={index} pillar={pillar} />
            ))}
          </div>
          {/* Invisible lower spacer to preserve overall component height */}
          <div aria-hidden="true" className="mx-auto max-w-3xl px-2">
            <div className="min-h-[3.75rem] sm:min-h-[3.25rem] lg:min-h-[4rem]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
