import { useEffect, useState } from "react";
import { images, SLIDE_INTERVAL_MS } from "../config/event";
import styles from "./Slideshow.module.css";

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      {images.map((img, i) => (
        <div
          key={img}
          className={styles.slide}
          style={{
            backgroundImage: `url(/images/${img})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
