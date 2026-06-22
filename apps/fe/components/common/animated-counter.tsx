"use client";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({
  value,
  suffix = "",
}: {
  value: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/\D/g, ""));

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
