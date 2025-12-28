import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number; // Tambahkan prop delay untuk efek staggered
}

export const ScrollReveal = ({ children, width = "fit-content", delay = 0 }: ScrollRevealProps) => {
  return (
    <div style={{ position: "relative", width, zIndex: 1 }}> 
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // Trigger saat 20% elemen terlihat
        transition={{ 
          duration: 0.6, 
          delay: delay, 
          ease: [0.22, 1, 0.36, 1] // Cubic bezier untuk kesan mewah
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};