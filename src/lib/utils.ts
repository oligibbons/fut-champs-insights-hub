import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect, useRef } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useLongPress = (callback = () => {}, ms = 1000) => {
  const [startLongPress, setStartLongPress] = useState(false);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;
    if (startLongPress) {
      timeoutId = window.setTimeout(() => {
        callback();
        setStartLongPress(false); 
      }, ms);
      timeoutIdRef.current = timeoutId;
    } else {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [startLongPress, ms, callback]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
};
