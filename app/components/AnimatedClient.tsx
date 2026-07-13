"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Simplified motion prop types to avoid fragile TS config assumptions
type MotionLikeProps = {
  children?: React.ReactNode;
  className?: string;
  initial?: any;
  whileInView?: any;
  animate?: any;
  transition?: any;
  viewport?: any;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children'>;

function useReduce() {
  return useReducedMotion();
}

// Use React.ElementType to avoid relying on the global `JSX` namespace
function make<T extends React.ElementType>(tag: T) {
  return function AnimatedComponent(props: MotionLikeProps & React.ComponentPropsWithoutRef<T>) {
    const { children, initial, whileInView, animate, transition, viewport, ...rest } = props as any;
    const shouldReduce = useReduce();

    // If user prefers reduced motion, render plain element without motion props
    if (shouldReduce) {
      const Tag = tag as any;
      return <Tag {...(rest as any)}>{children}</Tag>;
    }

    const MotionTag = (motion as any)[(tag as unknown) as string] as any;
    return (
      <MotionTag
        {...(rest as any)}
        initial={initial}
        whileInView={whileInView}
        animate={animate}
        transition={transition}
        viewport={viewport}
      >
        {children}
      </MotionTag>
    );
  };
}

export const Section = make('section');
export const Div = make('div');
export const Dl = make('dl');
export const Ul = make('ul');

export default {
  Section,
  Div,
  Dl,
  Ul,
};
