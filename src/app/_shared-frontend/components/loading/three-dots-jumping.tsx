"use client";

import { motion, type Variants } from "motion/react";

function LoadingThreeDotsJumping() {
  const dotVariants: Variants = {
    jump: {
      y: -5,
      transition: {
        duration: 0.4,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="container"
    >
      <motion.div className="dot" variants={dotVariants} />
      <motion.div className="dot" variants={dotVariants} />
      <motion.div className="dot" variants={dotVariants} />
      <StyleSheet />
    </motion.div>
  );
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
  return (
    <style>
      {`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .dot {
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background-color: #334155;
                will-change: transform;
            }
            `}
    </style>
  );
}

export default LoadingThreeDotsJumping;
