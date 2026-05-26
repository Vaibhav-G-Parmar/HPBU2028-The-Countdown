import { useCallback, useEffect, useId, useState } from "react";
import { MAX_UPLOAD_COUNT } from "../hooks/useSlides";
import styles from "./SlideLockPanel.module.css";

export const LOCK_PRESETS = [
  { id: "5m", label: "5 min", ms: 5 * 60 * 1000 },
  { id: "30m", label: "30 min", ms: 30 * 60 * 1000 },
  { id: "1h", label: "1 hr", ms: 60 * 60 * 1000 },
  { id: "5h", label: "5 hr", ms: 5 * 60 * 60 * 1000 },
  { id: "1d", label: "1 day", ms: 24 * 60 * 60 * 1000 },
];

export function lockDurationMs(presetId, customMinutes) {
  if (presetId === "custom") {
    const n = Number(customMinutes);
    const clamped = Math.min(Math.max(1, Number.isFinite(n) ? n : 60), 10080);
    return clamped * 60 * 1000;
  }
  const p = LOCK_PRESETS.find((x) => x.id === presetId);
  return p?.ms ?? 30 * 60 * 1000;
}

function formatRemaining(ms) {
  if (ms <= 0) return "0s";
  const s = Math.ceil(ms / 1000);
  const days = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (days > 0) return `${days}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function SlideLockPanel({
  open,
  onClose,
  onApply,
  slides = [],
  initialSlideIndex = 0,
  lockUntil = null,
  onEndEarly,
  onRequestUpload,
  onRemoveUploaded,
  uploadStatus = "",
  onClearUploadStatus,
}) {
  const titleId = useId();
  const [selected, setSelected] = useState(0);
  const [presetId, setPresetId] = useState("30m");
  const [customMinutes, setCustomMinutes] = useState(60);
  const [, setCountdownTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const max = Math.max(0, slides.length - 1);
    setSelected(Math.min(Math.max(0, initialSlideIndex), max));
    onClearUploadStatus?.();
  }, [open, initialSlideIndex, slides.length, onClearUploadStatus]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const lockRemainingMs =
    lockUntil != null && lockUntil > Date.now() ? lockUntil - Date.now() : 0;
  const showActiveLock = open && lockUntil != null && lockRemainingMs > 0;

  useEffect(() => {
    if (!showActiveLock) return;
    const id = window.setInterval(() => setCountdownTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [showActiveLock]);

  const handleApply = () => {
    const ms = lockDurationMs(presetId, customMinutes);
    const until = Date.now() + ms;
    const max = Math.max(0, slides.length - 1);
    onApply(Math.min(Math.max(0, selected), max), until);
    onClose();
  };

  if (!open) return null;

  const uploadedCount = slides.filter((s) => s.kind === "upload").length;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {showActiveLock && (
          <div className={styles.activeLock} role="status">
            <span className={styles.activeLockText}>
              Slide locked · {formatRemaining(lockRemainingMs)} left
            </span>
            <button
              type="button"
              className={styles.btnEndEarly}
              onClick={() => onEndEarly?.()}
            >
              End early
            </button>
          </div>
        )}
        <h2 id={titleId} className={styles.title}>
          Pick a slide & lock duration
        </h2>
        <p className={styles.hint}>
          Choose an image, then how long it stays fixed before the slideshow
          continues randomly. Photos you add are saved on this device only.
        </p>

        <div className={styles.uploadRow}>
          <button
            type="button"
            className={styles.btnUpload}
            onClick={onRequestUpload}
            disabled={uploadedCount >= MAX_UPLOAD_COUNT}
          >
            Add photos from device
          </button>
          <span className={styles.uploadHint}>
            JPEG, PNG, GIF, WebP, AVIF · up to 10 MB each · {uploadedCount}/{MAX_UPLOAD_COUNT} uploaded
          </span>
        </div>
        {uploadStatus && (
          <p className={styles.uploadStatus} role="status">
            {uploadStatus}
          </p>
        )}

        <div className={styles.grid} role="listbox" aria-label="Slides">
          {slides.map((slide, i) => (
            <div key={slide.id} className={styles.thumbWrap}>
              <button
                type="button"
                role="option"
                aria-selected={selected === i}
                className={`${styles.thumb} ${selected === i ? styles.thumbSelected : ""}`}
                onClick={() => setSelected(i)}
              >
                <img
                  src={slide.url}
                  alt=""
                  className={styles.thumbImg}
                  draggable={false}
                />
                <span className={styles.thumbLabel}>
                  {slide.kind === "upload" ? "Your photo" : slide.label}
                </span>
              </button>
              {slide.kind === "upload" && onRemoveUploaded && (
                <button
                  type="button"
                  className={styles.thumbRemove}
                  aria-label={`Remove ${slide.label}`}
                  onClick={() => onRemoveUploaded(slide.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Duration</legend>
          <div className={styles.presets}>
            {LOCK_PRESETS.map((p) => (
              <label key={p.id} className={styles.presetLabel}>
                <input
                  type="radio"
                  name="lock-preset"
                  value={p.id}
                  checked={presetId === p.id}
                  onChange={() => setPresetId(p.id)}
                />
                <span>{p.label}</span>
              </label>
            ))}
            <label className={styles.presetLabel}>
              <input
                type="radio"
                name="lock-preset"
                value="custom"
                checked={presetId === "custom"}
                onChange={() => setPresetId("custom")}
              />
              <span>Custom (minutes)</span>
            </label>
          </div>
          {presetId === "custom" && (
            <div className={styles.customRow}>
              <label htmlFor="lock-custom-min">Minutes</label>
              <input
                id="lock-custom-min"
                type="number"
                min={1}
                max={10080}
                step={1}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className={styles.customInput}
              />
              <span className={styles.customHint}>1–10080 (7 days max)</span>
            </div>
          )}
        </fieldset>

        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleApply}
            disabled={slides.length === 0}
          >
            Lock slide
          </button>
        </div>
      </div>
    </div>
  );
}
