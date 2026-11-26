"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({
  children,
  delay = 0,
  className = "",
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{
        y: -3,
        transition: { duration: 0.18, ease: "easeOut" },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
