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

export default function Countdown() {
  const [time, setTime] = useState(computeTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.over) {
    return (
      <div className={styles.over}>ॐ The Divine Gathering Has Begun ॐ</div>
    );
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: pad(time.hours) },
    { label: "Minutes", value: pad(time.minutes) },
    { label: "Seconds", value: pad(time.seconds) },
  ];

  return (
    <div className={styles.countdown}>
      {units.map(({ label, value }, i) => (
        <div key={label} className={styles.unit}>
          <span className={styles.number}>{value}</span>
          <span className={styles.label}>{label}</span>
          {i < units.length - 1 && <span className={styles.separator}>:</span>}
        </div>
      ))}
    </div>
  );
}
