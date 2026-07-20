// Access layer for the full KJV corpus. Per-book JSON lives in public/bible/
// (compact { id, name, chapters: string[][] } — chapters[c][v] = verse text)
// and is fetched lazily and cached, so only books you open are downloaded.

import { BOOKS, OT_COUNT } from "./data";

export type Testament = "OT" | "NT";
export type BookMeta = { id: string; name: string; chapters: number; testament: Testament };
export type LoadedBook = { id: string; name: string; chapters: string[][] };

/** URL-safe id for a book name, e.g. "Song of Solomon" -> "song-of-solomon". */
export function slug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** Static metadata for all 66 books, derived from the seed book list. */
export const BIBLE_BOOKS: BookMeta[] = BOOKS.map((b, i) => ({
  id: slug(b.name),
  name: b.name,
  chapters: b.chapters,
  testament: i < OT_COUNT ? "OT" : "NT",
}));

const BY_ID = new Map(BIBLE_BOOKS.map((b) => [b.id, b]));
export function bookMeta(id: string): BookMeta | undefined {
  return BY_ID.get(id);
}

/** Ordered book ids — used for "next/previous book" navigation. */
export const BOOK_IDS = BIBLE_BOOKS.map((b) => b.id);

const cache = new Map<string, LoadedBook>();
const inflight = new Map<string, Promise<LoadedBook>>();

/** Fetch (and cache) a book's full text. Safe to call repeatedly. */
export function loadBook(id: string): Promise<LoadedBook> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(id);
  if (pending) return pending;
  const url = `${import.meta.env.BASE_URL}bible/${id}.json`;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${id} (HTTP ${r.status})`);
      return r.json() as Promise<LoadedBook>;
    })
    .then((data) => {
      cache.set(id, data);
      inflight.delete(id);
      return data;
    })
    .catch((e) => {
      inflight.delete(id);
      throw e;
    });
  inflight.set(id, p);
  return p;
}

/** Synchronously read an already-loaded book, if present. */
export function cachedBook(id: string): LoadedBook | undefined {
  return cache.get(id);
}

// ---- reference keys ---------------------------------------------------------
// Bookmarks/notes are keyed by a canonical "bookId/chapter/verse" string so they
// work across the whole Bible; display refs like "John 3:16" are derived.

export type Ref = { bookId: string; chapter: number; verse: number };

export function refKey(r: Ref): string {
  return `${r.bookId}/${r.chapter}/${r.verse}`;
}

export function parseRefKey(key: string): Ref | null {
  const [bookId, c, v] = key.split("/");
  const chapter = parseInt(c, 10);
  const verse = parseInt(v, 10);
  if (!bookId || !Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
  return { bookId, chapter, verse };
}

/** Human-readable reference, e.g. "John 3:16". */
export function displayRef(r: Ref): string {
  const name = bookMeta(r.bookId)?.name ?? r.bookId;
  return `${name} ${r.chapter}:${r.verse}`;
}
