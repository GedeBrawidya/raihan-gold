import { motion } from "framer-motion";
import { ReactNode } from "react";

type AnimationType = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "rotate" | "slideUp";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  animation?: AnimationType;
  duration?: number;
  distance?: number;
  className?: string;
}

const animationVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
};

export const ScrollReveal = ({ 
  children, 
  width = "fit-content", 
  delay = 0,
  animation = "fadeUp",
  duration = 0.6,
  distance = 30,
  className = ""
}: ScrollRevealProps) => {
  // Custom variants dengan distance yang bisa diatur
  const customVariants = {
    hidden: { 
      ...animationVariants[animation].hidden,
      ...(animation === "fadeUp" && { y: distance }),
      ...(animation === "fadeDown" && { y: -distance }),
      ...(animation === "fadeLeft" && { x: -distance }),
      ...(animation === "fadeRight" && { x: distance }),
    },
    visible: animationVariants[animation].visible,
  };

  return (
    <div style={{ position: "relative", width, zIndex: 1, overflow: "hidden" }} className={className}> 
      <motion.div
        variants={customVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2, margin: "0px" }} // Margin 0px untuk menghindari area putih
        transition={{ 
          duration: duration, 
          delay: delay, 
          ease: [0.22, 1, 0.36, 1] // Cubic bezier untuk kesan mewah
        }}
        style={{ willChange: "transform, opacity" }} // Optimasi performa
      >
        {children}
      </motion.div>
    </div>
  );
};