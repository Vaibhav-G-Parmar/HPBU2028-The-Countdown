import { useCallback, useState } from "react";
import Countdown from "./Countdown";
import Slideshow from "./Slideshow";
import { EVENT_TITLE, FOOTER_EVENT_LINE } from "../config/event";
import styles from "./Hero.module.css";

export default function Hero() {
  const [timerOnly, setTimerOnly] = useState(false);

  const toggleTimerOnly = useCallback(() => {
    setTimerOnly((v) => !v);
  }, []);

  return (
    <div className={styles.hero}>
      <div
        className={`${styles.heroBackdrop} ${timerOnly ? styles.heroBackdropVisible : ""}`}
        aria-hidden
      />

      <div
        className={`${styles.slideshowLayer} ${timerOnly ? styles.layerHidden : ""}`}
        aria-hidden={timerOnly}
      >
        <Slideshow />
      </div>

      <div
        className={`${styles.overlay} ${timerOnly ? styles.layerHidden : ""}`}
        aria-hidden="true"
      />

      <div
        className={`${styles.layout} ${timerOnly ? styles.layoutTimerOnly : ""}`}
      >
        <div className={styles.rowTop} aria-hidden={timerOnly}>
          <header className={styles.rowTopInner}>
            <h1 className={`${styles.title} ${styles.topLineTitle}`}>{EVENT_TITLE}</h1>

            <div className={styles.dividerBetweenTop} aria-hidden>
              <span className={styles.dividerLine} />
              <span className={styles.dividerDot}>✦</span>
              <span className={styles.dividerLine} />
            </div>
          </header>
        </div>

        <div
          className={`${styles.timerShell} ${timerOnly ? styles.timerShellFocused : ""}`}
        >
          <div className={styles.topLineTimer}>
            <Countdown expanded={timerOnly} onToggle={toggleTimerOnly} />
          </div>
        </div>

        <div className={styles.rowBottom} aria-hidden={timerOnly}>
          <footer className={styles.bottomSection}>
            <p className={styles.footerTagline}>{FOOTER_EVENT_LINE}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
