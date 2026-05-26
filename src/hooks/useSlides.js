import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { builtinSlides } from "../lib/builtinSlides";
import {
  deleteUploadedSlide,
  loadUploadedSlides,
  saveUploadedSlide,
} from "../lib/uploadedSlidesDb";

const IMAGE_TYPES = /^image\/(jpe?g|png|gif|webp|avif)$/i;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_COUNT = 40;

function slideFromRecord(record) {
  return {
    id: record.id,
    label: record.name.replace(/\.[^.]+$/, ""),
    url: URL.createObjectURL(record.blob),
    kind: "upload",
  };
}

export function useSlides() {
  const [uploadedSlides, setUploadedSlides] = useState([]);
  const [uploadsReady, setUploadsReady] = useState(false);
  const [status, setStatus] = useState("");
  const revokeRef = useRef([]);

  const trackUrl = useCallback((url) => {
    revokeRef.current.push(url);
  }, []);

  const revokeUploadedUrls = useCallback((slides) => {
    for (const s of slides) {
      if (s.kind === "upload" && s.url.startsWith("blob:")) {
        URL.revokeObjectURL(s.url);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadUploadedSlides()
      .then((records) => {
        if (cancelled) return;
        const slides = records.map((r) => {
          const slide = slideFromRecord(r);
          trackUrl(slide.url);
          return slide;
        });
        setUploadedSlides(slides);
        setUploadsReady(true);
      })
      .catch(() => {
        if (!cancelled) setUploadsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [trackUrl]);

  useEffect(
    () => () => {
      for (const url of revokeRef.current) URL.revokeObjectURL(url);
      revokeRef.current = [];
    },
    []
  );

  const slides = useMemo(
    () => [...builtinSlides(), ...uploadedSlides],
    [uploadedSlides]
  );

  const uploadCount = uploadedSlides.length;

  const addFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList ?? []).filter((f) => IMAGE_TYPES.test(f.type));
      if (files.length === 0) {
        setStatus("Choose a JPEG, PNG, GIF, WebP, or AVIF image.");
        return;
      }

      const room = MAX_UPLOAD_COUNT - uploadCount;
      if (room <= 0) {
        setStatus(`You can store up to ${MAX_UPLOAD_COUNT} uploaded photos on this device.`);
        return;
      }

      const toAdd = files.slice(0, room);
      const added = [];
      let skippedSize = 0;

      for (const file of toAdd) {
        if (file.size > MAX_UPLOAD_BYTES) {
          skippedSize += 1;
          continue;
        }
        const id = `upload:${crypto.randomUUID()}`;
        const record = {
          id,
          name: file.name,
          mimeType: file.type,
          blob: file,
          addedAt: Date.now(),
        };
        await saveUploadedSlide(record);
        const slide = slideFromRecord(record);
        trackUrl(slide.url);
        added.push(slide);
      }

      if (added.length > 0) {
        setUploadedSlides((prev) => [...prev, ...added]);
      }

      const parts = [];
      if (added.length > 0) parts.push(`Added ${added.length} photo${added.length === 1 ? "" : "s"}.`);
      if (skippedSize > 0) parts.push(`${skippedSize} skipped (over 10 MB).`);
      if (files.length > toAdd.length) {
        parts.push(`Only ${room} more upload${room === 1 ? "" : "s"} allowed on this device.`);
      }
      setStatus(parts.join(" ") || "Nothing was added.");
    },
    [uploadCount, trackUrl]
  );

  const removeUploaded = useCallback(
    async (id) => {
      const target = uploadedSlides.find((s) => s.id === id);
      if (!target || target.kind !== "upload") return;
      URL.revokeObjectURL(target.url);
      revokeRef.current = revokeRef.current.filter((u) => u !== target.url);
      await deleteUploadedSlide(id);
      setUploadedSlides((prev) => prev.filter((s) => s.id !== id));
      setStatus("Photo removed.");
    },
    [uploadedSlides]
  );

  const clearStatus = useCallback(() => setStatus(""), []);

  return {
    slides,
    uploadsReady,
    uploadCount,
    addFiles,
    removeUploaded,
    status,
    clearStatus,
  };
}
