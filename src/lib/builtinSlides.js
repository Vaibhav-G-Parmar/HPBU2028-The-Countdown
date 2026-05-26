import { SLIDE_IMAGE_FILENAMES } from "virtual:slide-images";

/** @returns {import("./slides.types").Slide[]} */
export function builtinSlides() {
  return SLIDE_IMAGE_FILENAMES.map((filename) => ({
    id: `builtin:${filename}`,
    label: filename.replace(/\.[^.]+$/, ""),
    url: `/images/${filename}`,
    kind: "builtin",
  }));
}
