import { useEffect, useRef, useState } from "react";
import {
  images,
  SLIDE_INTERVAL_MS,
  SLIDE_BACKGROUND_POSITION,
} from "../config/event";
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
 *   lockedIndex?: number | null;
 *   manualIndex?: number | null;
 *   onDisplayIndexChange?: (index: number) => void;
 * }} props lockedIndex fixes a slide; manualIndex steps prev/next (pauses random); else random.
 */
export default function Slideshow({
  lockedIndex = null,
  manualIndex = null,
  onDisplayIndexChange,
}) {
  const len = images.length;
  const [current, setCurrent] = useState(() =>
    len > 0 ? Math.floor(Math.random() * len) : 0
  );
  const onIndexRef = useRef(onDisplayIndexChange);
  onIndexRef.current = onDisplayIndexChange;

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

  return (
    <div className={styles.container} aria-hidden="true">
      {images.map((img, i) => (
        <div
          key={img}
          className={styles.slide}
          style={{
            backgroundImage: `url(/images/${img})`,
            backgroundPosition: SLIDE_BACKGROUND_POSITION,
            opacity: i === displayIndex ? 1 : 0,
            zIndex: i === displayIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
