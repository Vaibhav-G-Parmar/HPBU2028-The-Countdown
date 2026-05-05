/**
 * Slideshow files live in public/images/. Add the filename only (not a path).
 * Example: drop foo.jpg there, then append "foo.jpg" to this array.
 */
export const images = [
  "bhagya-jagya-re-desktop.jpg",
  "binshirti-jeevan-desktop.jpg",
  "duty-unto-death-dark-desktop.png",
  "god-is-at-the-center-desktop.jpg",
  "hu-mathi-tu-desktop.jpg",
  "sih-desktop.jpg",
  "tav-bansi-banavi-desktop.png",
];

export const SLIDE_INTERVAL_MS = 5000;

export const SLIDE_BACKGROUND_POSITION = "center 40%";

export const EVENT_DATE = new Date("2028-08-17T00:00:00");

export const EVENT_TITLE = "Hariprabodham Bhakti Utsav";

const shortEventDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(EVENT_DATE);

export const FOOTER_EVENT_LINE = `HPBU · ${shortEventDate}`;
