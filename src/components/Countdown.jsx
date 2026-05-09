import { useEffect, useState } from "react";
import { EVENT_DATE } from "../config/event";
import styles from "./Countdown.module.css";

function computeTimeLeft() {
  const now = Date.now();
  const diff = EVENT_DATE.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, over: false };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Countdown({ expanded = false, onToggle }) {
  const [time, setTime] = useState(computeTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.over) {
    if (!onToggle) {
      return (
        <div className={styles.over}>The Divine Gathering Has Begun</div>
      );
    }

    const ariaLabel = expanded
      ? "Show slideshow and full page"
      : "Hide slideshow; show message only";

    return (
      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-pressed={expanded}
        aria-label={ariaLabel}
      >
        <span className={`${styles.over} ${expanded ? styles.overExpanded : ""}`}>
          The Divine Gathering Has Begun
        </span>
      </button>
    );
  }

  const units = [
    { label: "Days", value: String(time.days), digitsClass: styles.digitsDays },
    { label: "Hours", value: pad(time.hours), digitsClass: styles.digitsPair },
    { label: "Minutes", value: pad(time.minutes), digitsClass: styles.digitsPair },
    { label: "Seconds", value: pad(time.seconds), digitsClass: styles.digitsPair },
  ];

  const ariaLabel = expanded
    ? "Show slideshow and full page"
    : "Hide slideshow; show countdown only";

  const inner = (
    <span
      className={`${styles.countdown} ${expanded ? styles.countdownExpanded : ""}`}
    >
      {units.map(({ label, value, digitsClass }, i) => (
        <span key={label} className={styles.unit}>
          <span className={`${styles.digits} ${digitsClass}`}>{value}</span>
          <span className={styles.label}>{label}</span>
          {i < units.length - 1 && <span className={styles.separator}>:</span>}
        </span>
      ))}
    </span>
  );

  if (!onToggle) {
    return inner;
  }

  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={onToggle}
      aria-pressed={expanded}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  );
}
