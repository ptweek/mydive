"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "mydive/utils/tailwind";
import * as React from "react";

export function GradualSpacing({
  text = "Gradual Spacing",
  textClassName,
}: {
  text: string;
  textClassName?: string;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4">
      <AnimatePresence>
        {text.split(" ").map((word, i) => (
          <motion.span
            ref={ref}
            key={i}
            initial={{ opacity: 0, x: -18 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            exit="hidden"
            transition={{ duration: 2, delay: i * 0.1 }}
            className={cn(
              "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-center text-5xl font-bold tracking-tighter text-transparent",
              textClassName,
            )}
          >
            {word}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
