import Countdown from "./Countdown";
import Slideshow from "./Slideshow";
import { EVENT_TITLE, EVENT_SUBTITLE, EVENT_CODE } from "../config/event";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.hero}>
      {/* Full-screen image slideshow */}
      <Slideshow />

      {/* Dark devotional overlay */}
      <div className={styles.overlay} />

      {/* Centered content */}
      <div className={styles.content}>
        {/* Top ornament */}
        <div className={styles.ornamentTop}>
          <span className={styles.om}>ॐ</span>
        </div>

        {/* Event code */}
        <p className={styles.eventCode}>{EVENT_CODE}</p>

        {/* Decorative divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot}>✦</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Main title */}
        <h1 className={styles.title}>{EVENT_TITLE}</h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>{EVENT_SUBTITLE}</p>

        {/* Countdown timer */}
        <div className={styles.countdownWrapper}>
          <Countdown />
        </div>

        {/* Decorative divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot}>✦</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Event date */}
        <p className={styles.eventDate}>17 August 2028</p>
      </div>
    </div>
  );
}
