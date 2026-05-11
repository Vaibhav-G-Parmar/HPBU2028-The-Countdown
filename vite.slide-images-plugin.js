import fs from "node:fs";
import path from "node:path";

const VIRTUAL_ID = "virtual:slide-images";
const RESOLVED = "\0" + VIRTUAL_ID;

/** Raster extensions we treat as slideshow slides (drop files in public/images/). */
const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i;

function readSlideFilenames(projectRoot) {
  const dir = path.join(projectRoot, "public", "images");
  if (!fs.existsSync(dir)) return [];
  const names = fs.readdirSync(dir).filter(
    (name) => !name.startsWith(".") && IMAGE_RE.test(name)
  );
  names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return names;
}

function fileIsInSlideImagesDir(file, imagesDirAbs) {
  const resolvedFile = path.resolve(file);
  const resolvedDir = path.resolve(imagesDirAbs);
  if (resolvedFile === resolvedDir) return false;
  const parent = path.dirname(resolvedFile);
  return parent === resolvedDir;
}

/**
 * Exposes every image filename in public/images/ as a build-time list (no manual array).
 * Dev server invalidates when files are added/removed/changed in that folder.
 */
export function slideImagesFromPublic() {
  const projectRoot = process.cwd();
  const imagesDirAbs = path.join(projectRoot, "public", "images");

  return {
    name: "slide-images-from-public",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      const filenames = readSlideFilenames(projectRoot);
      return `export const SLIDE_IMAGE_FILENAMES = ${JSON.stringify(filenames)};`;
    },
    configureServer(server) {
      const invalidate = () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };

      if (fs.existsSync(imagesDirAbs)) {
        server.watcher.add(imagesDirAbs);
      }

      server.watcher.on("all", (_event, file) => {
        if (typeof file === "string" && fileIsInSlideImagesDir(file, imagesDirAbs)) {
          invalidate();
        }
      });
    },
  };
}
