const DB_NAME = "hpbu2028";
const STORE = "uploadedSlides";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

/**
 * @returns {Promise<Array<{ id: string; name: string; mimeType: string; blob: Blob; addedAt: number }>>}
 */
export async function loadUploadedSlides() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = req.result ?? [];
      rows.sort((a, b) => a.addedAt - b.addedAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
    db.close();
  });
}

/**
 * @param {{ id: string; name: string; mimeType: string; blob: Blob; addedAt: number }} record
 */
export async function saveUploadedSlide(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** @param {string} id */
export async function deleteUploadedSlide(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
