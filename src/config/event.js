import { SLIDE_IMAGE_FILENAMES } from "virtual:slide-images";

/**
 * Slideshow uses every raster image file in `public/images/` at dev/build time
 * (see vite.slide-images-plugin.js). Drop new photos there — no list to edit.
 */
export const images = SLIDE_IMAGE_FILENAMES;

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
