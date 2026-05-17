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
  /** Manual prev/next index; pauses random slideshow until cleared. */
  const [manualIndex, setManualIndex] = useState(null);
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
    setManualIndex(null);
    setSlideLock({ index, until });
  }, []);

  const navDisabled = images.length <= 1 || isSlideLocked;

  const goPrevSlide = useCallback(() => {
    if (navDisabled) return;
    const base = manualIndex ?? liveSlideIndex;
    setManualIndex((base - 1 + images.length) % images.length);
  }, [navDisabled, manualIndex, liveSlideIndex]);

  const goNextSlide = useCallback(() => {
    if (navDisabled) return;
    const base = manualIndex ?? liveSlideIndex;
    setManualIndex((base + 1) % images.length);
  }, [navDisabled, manualIndex, liveSlideIndex]);

  const endSlideLock = useCallback(() => {
    setSlideLock((prev) => {
      if (prev) setManualIndex(prev.index);
      return null;
    });
  }, []);

  const closeLockPanel = useCallback(() => {
    setLockPanelOpen(false);
  }, []);

  const handleQuickLockClick = useCallback(() => {
    if (images.length === 0) return;
    if (isSlideLocked) {
      endSlideLock();
      return;
    }
    const max = images.length - 1;
    const index = Math.min(Math.max(0, liveSlideIndex), max);
    setManualIndex(null);
    setSlideLock({ index, until: Date.now() + QUICK_LOCK_MS });
    setQuickLockLatch(true);
    window.setTimeout(() => setQuickLockLatch(false), 580);
  }, [isSlideLocked, liveSlideIndex, endSlideLock]);

  useEffect(() => {
    if (timerOnly || lockPanelOpen) return;
    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextSlide();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timerOnly, lockPanelOpen, goPrevSlide, goNextSlide]);

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
          manualIndex={manualIndex}
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
              <div className={styles.slideDock}>
                <div
                  className={styles.slideDockInner}
                  role="toolbar"
                  aria-label="Slides and lock"
                  aria-orientation="horizontal"
                >
                  <button
                    type="button"
                    className={styles.slideDockBtn}
                    onClick={() => setLockPanelOpen(true)}
                    aria-label={
                      isSlideLocked
                        ? "Slides — open gallery; slide is locked, manage time or end early"
                        : "Slides — open gallery to pick an image and lock duration"
                    }
                  >
                    <span className={styles.slideDockIcon} aria-hidden>
                      🖼
                    </span>
                  </button>
                  <span className={styles.slideDockSep} aria-hidden />
                  <button
                    type="button"
                    className={`${styles.slideDockBtn} ${isSlideLocked ? styles.slideDockBtnLockLocked : ""} ${quickLockLatch ? styles.slideDockBtnLockLatch : ""}`}
                    onClick={handleQuickLockClick}
                    disabled={images.length === 0}
                    aria-pressed={isSlideLocked}
                    aria-label={
                      isSlideLocked
                        ? "Quick lock — slide is locked, tap to unlock"
                        : "Quick lock — lock the current slide for 5 minutes"
                    }
                  >
                    <span className={styles.slideDockIcon} aria-hidden>
                      {isSlideLocked ? "🔒" : "🔓"}
                    </span>
                  </button>
                </div>
              </div>
            )}
            <SlideLockPanel
              open={lockPanelOpen && !timerOnly}
              onClose={closeLockPanel}
              onApply={handleLockApply}
              initialSlideIndex={pickInitialIndex}
              lockUntil={slideLock?.until ?? null}
              onEndEarly={endSlideLock}
            />
          </>,
          document.body
        )}
    </div>
  );
}
