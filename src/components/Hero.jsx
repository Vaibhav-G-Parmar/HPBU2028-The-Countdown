import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Countdown from "./Countdown";
import Slideshow from "./Slideshow";
import SlideLockPanel from "./SlideLockPanel";
import { EVENT_TITLE, FOOTER_EVENT_LINE } from "../config/event";
import styles from "./Hero.module.css";

export default function Hero() {
  const [timerOnly, setTimerOnly] = useState(false);
  const [lockPanelOpen, setLockPanelOpen] = useState(false);
  /** @type {{ index: number; until: number } | null} */
  const [slideLock, setSlideLock] = useState(null);
  const [portalReady, setPortalReady] = useState(false);

  const toggleTimerOnly = useCallback(() => {
    setTimerOnly((v) => !v);
  }, []);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (timerOnly) setLockPanelOpen(false);
  }, [timerOnly]);

  useEffect(() => {
    if (!slideLock) return;
    const ms = slideLock.until - Date.now();
    if (ms <= 0) {
      setSlideLock(null);
      return;
    }
    const id = window.setTimeout(() => setSlideLock(null), ms);
    return () => clearTimeout(id);
  }, [slideLock]);

  const lockedIndex =
    slideLock && Date.now() < slideLock.until ? slideLock.index : null;

  const isSlideLocked = lockedIndex !== null;

  const handleLockApply = useCallback((index, until) => {
    setSlideLock({ index, until });
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
        <Slideshow lockedIndex={lockedIndex} />
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

      {portalReady &&
        createPortal(
          <>
            {!timerOnly && (
              <div className={styles.lockHud}>
                <button
                  type="button"
                  className={styles.lockOpenBtn}
                  onClick={() => setLockPanelOpen(true)}
                  aria-label={
                    isSlideLocked
                      ? "Slides — slide is locked; open to see time left or end early"
                      : "Slides"
                  }
                >
                  Slides
                  {isSlideLocked && (
                    <span className={styles.slidesLockEmoji} aria-hidden>
                      🔒
                    </span>
                  )}
                </button>
              </div>
            )}
            <SlideLockPanel
              open={lockPanelOpen && !timerOnly}
              onClose={() => setLockPanelOpen(false)}
              onApply={handleLockApply}
              initialSlideIndex={slideLock?.index ?? 0}
              lockUntil={slideLock?.until ?? null}
              onEndEarly={() => setSlideLock(null)}
            />
          </>,
          document.body
        )}
    </div>
  );
}
