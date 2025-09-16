import { openDB, IDBPDatabase, deleteDB } from 'idb';

/** --- Types --- */
export interface EventImage {
  url: string;
}
export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  price?: string;
  images?: EventImage[];
  description: string;
  // add other JSON-safe fields if needed
}

const DB_NAME = 'ticketmasterDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

/** Create/open DB */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise!;
}

/** 🔑 Sanitize the object so it can be structured-cloned */
function sanitizeEvent(event: any): EventItem {
  return {
    id: String(event.id),
    title: String(event.title ?? ''),
    date: String(event.date ?? ''),
    location: String(event.location ?? ''),
    price: event.price ? String(event.price) : undefined,
    description: event.info,
    images: (event.images || []).map((img: any) => ({ url: String(img.url) })),
  };
}

export const dbService = {
  /* ---------------- Events Cache ---------------- */
  async saveEvents(events: any[]) {
    const db = await getDB();
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    for (const raw of events) {
      const e = sanitizeEvent(raw);
      await store.put(e);
    }
    await tx.done;
  },

  async getAllEvents(): Promise<EventItem[]> {
    const db = await getDB();
    return await db.getAll('events');
  },

  async getEventById(id: string): Promise<EventItem | undefined> {
    const db = await getDB();
    return await db.get('events', id);
  },

  /* ---------------- Bookmarks ---------------- */
  async addBookmark(event: any) {
    const db = await getDB();
    const e = sanitizeEvent(event);
    const tx = db.transaction('bookmarks', 'readwrite');
    await tx.objectStore('bookmarks').put(e);
    await tx.done;
  },

  async removeBookmark(id: string) {
    const db = await getDB();
    const tx = db.transaction('bookmarks', 'readwrite');
    await tx.objectStore('bookmarks').delete(id);
    await tx.done;
  },

  async getBookmarks(): Promise<EventItem[]> {
    const db = await getDB();
    return await db.getAll('bookmarks');
  },

  async isBookmarked(id: string): Promise<boolean> {
    const db = await getDB();
    return (await db.get('bookmarks', id)) !== undefined;
  },

  async clearDatabase(): Promise<void> {
    // Close any open connection before deleting
    if (dbPromise) {
      const db = await dbPromise;
      db.close();
      dbPromise = null;
    }

    await deleteDB(DB_NAME, {
      blocked() {
        console.warn('Database deletion is blocked — close all open tabs or connections.');
      },
    });

    console.log(`Database "${DB_NAME}" deleted successfully.`);
  },
};
