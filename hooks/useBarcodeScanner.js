import { useEffect, useRef } from "react";

/**
 * Hook to detect barcode scanner input.
 * Scanners typically emulate keyboard input but very fast.
 * 
 * @param {Function} onScan - Callback function called with scanned barcode string
 * @param {boolean} enabled - Whether the scanner is active (default true)
 * @param {number} minLength - Minimum length of barcode to trigger (default 3)
 */
export default function useBarcodeScanner(onScan, enabled = true, minLength = 3) {
  const buffer = useRef("");
  const lastKeyTime = useRef(0);
  
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e) => {
      // 1. Ignore if user is typing in an input field
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const now = Date.now();
      const char = e.key;
      
      // 2. Check timing (Scanner is fast, <50ms usually)
      // If gap is too large, reset buffer (it's manual typing)
      if (now - lastKeyTime.current > 100) {
        buffer.current = "";
      }
      lastKeyTime.current = now;

      // 3. Handle Enter (End of scan)
      if (char === "Enter") {
        if (buffer.current.length >= minLength) {
          e.preventDefault();
          onScan(buffer.current);
        }
        buffer.current = "";
        return;
      }

      // 4. Accumulate characters (alphanumeric only usually, but let's take all printable)
      if (char.length === 1) {
        buffer.current += char;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, enabled, minLength]);
}
