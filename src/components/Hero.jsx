import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Countdown from "./Countdown";
import Slideshow from "./Slideshow";
import SlideLockPanel from "./SlideLockPanel";
import { EVENT_TITLE, FOOTER_EVENT_LINE, images } from "../config/event";
import styles from "./Hero.module.css";

const QUICK_LOCK_MS = 5 * 60 * 1000;

export default function Hero() {
  const [timerOnly, setTimerOnly] = useState(false);
  const [lockPanelOpen, setLockPanelOpen] = useState(false);
  const [liveSlideIndex, setLiveSlideIndex] = useState(0);
  /** @type {{ index: number; until: number } | null} */
  const [slideLock, setSlideLock] = useState(null);
  const [portalReady, setPortalReady] = useState(false);
  const [quickLockLatch, setQuickLockLatch] = useState(false);

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

  const closeLockPanel = useCallback(() => {
    setLockPanelOpen(false);
  }, []);

  const handleQuickLockClick = useCallback(() => {
    if (images.length === 0) return;
    if (isSlideLocked) {
      setSlideLock(null);
      return;
    }
    const max = images.length - 1;
    const index = Math.min(Math.max(0, liveSlideIndex), max);
    setSlideLock({ index, until: Date.now() + QUICK_LOCK_MS });
    setQuickLockLatch(true);
    window.setTimeout(() => setQuickLockLatch(false), 580);
  }, [isSlideLocked, liveSlideIndex]);

  const pickInitialIndex =
    isSlideLocked && slideLock ? slideLock.index : liveSlideIndex;

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
        <Slideshow
          lockedIndex={lockedIndex}
          onDisplayIndexChange={setLiveSlideIndex}
        />
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
              <>
                <div className={styles.quickLockHud}>
                  <button
                    type="button"
                    className={`${styles.quickLockBtn} ${isSlideLocked ? styles.quickLockBtnLocked : ""} ${quickLockLatch ? styles.quickLockBtnLatch : ""}`}
                    onClick={handleQuickLockClick}
                    disabled={images.length === 0}
                    aria-pressed={isSlideLocked}
                    aria-label={
                      isSlideLocked
                        ? "Quick lock — slide is locked, tap to unlock"
                        : "Quick lock — lock the current slide for 5 minutes"
                    }
                  >
                    <span className={styles.quickLockIcon} aria-hidden>
                      {isSlideLocked ? "🔒" : "🔓"}
                    </span>
                  </button>
                </div>
                <div className={styles.lockHud}>
                  <button
                    type="button"
                    className={styles.lockOpenBtn}
                    onClick={() => setLockPanelOpen(true)}
                    aria-label={
                      isSlideLocked
                        ? "Slides — slide is locked; open to see time left or end early"
                        : "Slides — pick an image to lock"
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
              </>
            )}
            <SlideLockPanel
              open={lockPanelOpen && !timerOnly}
              onClose={closeLockPanel}
              onApply={handleLockApply}
              initialSlideIndex={pickInitialIndex}
              lockUntil={slideLock?.until ?? null}
              onEndEarly={() => setSlideLock(null)}
            />
          </>,
          document.body
        )}
    </div>
  );
}
