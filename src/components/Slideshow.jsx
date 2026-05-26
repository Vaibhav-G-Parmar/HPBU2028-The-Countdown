import { useEffect, useRef, useState } from "react";
import { SLIDE_INTERVAL_MS, SLIDE_BACKGROUND_POSITION } from "../config/event";
import styles from "./Slideshow.module.css";

function randomIndexExcept(length, except) {
  if (length <= 1) return 0;
  let next;
  do {
    next = Math.floor(Math.random() * length);
  } while (next === except);
  return next;
}

/**
 * @param {{
 *   slides: Array<{ id: string; url: string }>;
 *   lockedIndex?: number | null;
 *   manualIndex?: number | null;
 *   onDisplayIndexChange?: (index: number) => void;
 * }} props
 */
export default function Slideshow({
  slides,
  lockedIndex = null,
  manualIndex = null,
  onDisplayIndexChange,
}) {
  const len = slides.length;
  const [current, setCurrent] = useState(() =>
    len > 0 ? Math.floor(Math.random() * len) : 0
  );
  const onIndexRef = useRef(onDisplayIndexChange);
  onIndexRef.current = onDisplayIndexChange;

  useEffect(() => {
    if (len === 0) return;
    setCurrent((prev) => Math.min(prev, len - 1));
  }, [len]);

  useEffect(() => {
    if (lockedIndex !== null && lockedIndex >= 0 && lockedIndex < len) {
      setCurrent(lockedIndex);
    }
  }, [lockedIndex, len]);

  useEffect(() => {
    if (lockedIndex !== null || manualIndex !== null) return;
    if (len <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => randomIndexExcept(len, prev));
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [len, lockedIndex, manualIndex]);

  const displayIndex =
    lockedIndex !== null && lockedIndex >= 0 && lockedIndex < len
      ? lockedIndex
      : manualIndex !== null && manualIndex >= 0 && manualIndex < len
        ? manualIndex
        : current;

  useEffect(() => {
    onIndexRef.current?.(displayIndex);
  }, [displayIndex]);

  if (len === 0) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={styles.slide}
          style={{
            backgroundImage: `url(${slide.url})`,
            backgroundPosition: SLIDE_BACKGROUND_POSITION,
            opacity: i === displayIndex ? 1 : 0,
            zIndex: i === displayIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
