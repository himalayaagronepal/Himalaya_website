'use client';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

type SectionTitleProps = {
  title: string;
  className?: string;
};

export default function SectionTitle({ title, className = '' }: SectionTitleProps) {
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex justify-center"
      >
        <div className="flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-green-100">
          <Leaf className="h-5 w-5 lg:h-4 lg:w-4 text-green-700" strokeWidth={2} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
        className="mt-4 lg:mt-3 flex items-center justify-center gap-3 sm:gap-5"
      >
        <span className="h-px w-12 sm:w-20 border-t-2 border-dashed border-green-700/40" />
        <h2 className="text-lg sm:text-xl lg:text-[20px] xl:text-[22px] font-bold uppercase tracking-[0.18em] text-green-800 text-center">
          {title}
        </h2>
        <span className="h-px w-12 sm:w-20 border-t-2 border-dashed border-green-700/40" />
      </motion.div>
    </div>
  );
}
