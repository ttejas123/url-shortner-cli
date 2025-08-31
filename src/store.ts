import fs from "fs";
import path from "path";
import os from "os";

export type Link = {
    code: string;
    url: string;
    createdAt: string; // ISO
    hits: number;
};

const DIR = path.join(os.homedir(), ".urlshort");
const DB_PATH = path.join(DIR, "db.json");

function ensureDb() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ links: [] }, null, 2));
}

export function loadAll(): Link[] {
    ensureDb();
    console.log("Loading links from", DB_PATH);
    const raw = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    return raw.links as Link[];
}

export function saveAll(links: Link[]) {
    ensureDb();
    fs.writeFileSync(DB_PATH, JSON.stringify({ links }, null, 2));
}

export function upsert(link: Link) {
    const links = loadAll();
    const idx = links.findIndex(l => l.code === link.code);
    if (idx >= 0) links[idx] = link; else links.push(link);
    saveAll(links);
}

export function remove(code: string): boolean {
    const links = loadAll();
    const next = links.filter(l => l.code !== code);
    const changed = next.length !== links.length;
    if (changed) saveAll(next);
    return changed;
}

export function findByCode(code: string): Link | undefined {
    return loadAll().find(l => l.code === code);
}
