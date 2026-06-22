"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TypeWriter = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="bg-primary ml-1 inline-block h-[1em] w-[3px] align-middle"
      />
    </span>
  );
};

export default TypeWriter;
