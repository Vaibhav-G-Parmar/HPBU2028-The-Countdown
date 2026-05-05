import Countdown from "./Countdown";
import Slideshow from "./Slideshow";
import { EVENT_TITLE, FOOTER_EVENT_LINE } from "../config/event";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.hero}>
      <Slideshow />

      <div className={styles.overlay} />

      <div className={styles.layout}>
        <header className={styles.topSection}>
          <h1 className={`${styles.title} ${styles.topLineTitle}`}>{EVENT_TITLE}</h1>

          <div className={styles.dividerBetweenTop} aria-hidden>
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot}>✦</span>
            <span className={styles.dividerLine} />
          </div>

          <div className={styles.topLineTimer}>
            <Countdown />
          </div>
        </header>

        <footer className={styles.bottomSection}>
          <p className={styles.footerTagline}>{FOOTER_EVENT_LINE}</p>
        </footer>
      </div>
    </div>
  );
}
