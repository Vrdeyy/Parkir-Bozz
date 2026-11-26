"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
}

export default function WordReveal({
  text,
  className = "",
  wordClassName = "",
  tag: Tag = "h2",
  delay = 0,
}: WordRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const words = containerRef.current.querySelectorAll(".reveal-word");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          opacity: 0,
          y: 14,
          filter: "blur(3px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          delay,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text, delay]);

  const words = text.split(" ");

  return (
    <Tag
      ref={containerRef as any}
      className={`inline-flex flex-wrap gap-x-1.5 gap-y-0.5 ${className}`}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className={`reveal-word inline-block will-change-transform ${wordClassName}`}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
