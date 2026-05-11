import { useEffect, useState } from "react";
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

export default function Slideshow() {
  const len = images.length;
  const [current, setCurrent] = useState(() =>
    len > 0 ? Math.floor(Math.random() * len) : 0
  );

  useEffect(() => {
    if (len <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => randomIndexExcept(len, prev));
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [len]);

  return (
    <div className={styles.container} aria-hidden="true">
      {images.map((img, i) => (
        <div
          key={img}
          className={styles.slide}
          style={{
            backgroundImage: `url(/images/${img})`,
            backgroundPosition: SLIDE_BACKGROUND_POSITION,
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
