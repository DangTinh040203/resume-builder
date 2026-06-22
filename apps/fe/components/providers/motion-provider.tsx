"use client";

import { domAnimation, LazyMotion } from "framer-motion";
import { type PropsWithChildren } from "react";

/**
 * LazyMotion provider that loads only the `domAnimation` feature set.
 * This reduces framer-motion bundle by ~60% compared to the full bundle.
 * Only includes: animate, exit, variants, whileHover, whileTap, whileInView
 * Does NOT include: layout animations, drag, path animations
 */
export default function MotionProvider({ children }: PropsWithChildren) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
