// Regenerates the KJV corpus in public/bible/.
//
// Fetches the public-domain King James Version (compilation from
// github.com/aruljohn/Bible-kjv) and writes one compact JSON file per book
// ({ id, name, chapters: string[][] } — chapters[c][v] = verse text), plus an
// index.json manifest. Run with:  node scripts/fetch-bible.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "bible");
const BASE = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master";
const OT_COUNT = 39;

const slug = (name) => name.toLowerCase().replace(/\s+/g, "-");
const fileFor = (name) => name.replace(/\s+/g, "");

const books = await (await fetch(`${BASE}/Books.json`)).json();
await mkdir(OUT, { recursive: true });

const manifest = [];
let totalBytes = 0;

async function fetchBook(name, i) {
  const url = `${BASE}/${fileFor(name)}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} (${url})`);
  const raw = await res.json();
  const chapters = raw.chapters.map((ch) => ch.verses.map((vs) => vs.text));
  const id = slug(name);
  const body = JSON.stringify({ id, name, chapters });
  await writeFile(join(OUT, `${id}.json`), body);
  totalBytes += body.length;
  manifest.push({
    id,
    name,
    testament: i < OT_COUNT ? "OT" : "NT",
    chapters: chapters.length,
    verses: chapters.map((c) => c.length),
  });
}

// modest concurrency
let idx = 0;
const worker = async () => {
  while (idx < books.length) {
    const my = idx++;
    await fetchBook(books[my], my);
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

manifest.sort((a, b) => books.indexOf(a.name) - books.indexOf(b.name));
await writeFile(join(OUT, "index.json"), JSON.stringify(manifest));

const verses = manifest.reduce((n, b) => n + b.verses.reduce((a, c) => a + c, 0), 0);
console.log(`Wrote ${manifest.length} books, ${verses} verses, ${(totalBytes / 1e6).toFixed(2)} MB`);
