import { useState, useEffect, useRef } from "react";

/**
 * Simulates a typewriter effect for streaming text.
 * Takes the full text so far and reveals it character by character.
 */
export function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    // If text was reset, reset displayed too
    if (text.length < prevTextRef.current.length) {
      setDisplayed("");
      indexRef.current = 0;
    }
    prevTextRef.current = text;

    if (indexRef.current >= text.length) {
      setDisplayed(text);
      return;
    }

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        // Reveal in small chunks for smoother feel
        const chunk = Math.min(3, text.length - indexRef.current);
        indexRef.current += chunk;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const isTyping = displayed.length < text.length;

  return { displayed, isTyping };
}
