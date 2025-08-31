#!/usr/bin/env node
import { genCode, normalizeUrl } from "./utils.js";
import { spawn } from "child_process";
import { Link } from "./types/Links.js";
import { TinyDB } from "tiny-db";

const dbLink = new TinyDB<Link>("links.json");

// Simple args: url-short <cmd> [args] [--alias abc] [--len 7]
const [, , cmd, ...rest] = process.argv;

function getFlag(name: string, fallback?: string) {
    const i = rest.findIndex(x => x === `--${name}`);
    return i >= 0 ? rest[i + 1] : fallback;
}

function printHelp() {
    console.log(`
Usage:
  url-short -s <url> [--alias <code>] [--len <n>] Create a short code
  url-short -e <code>                                 Print original URL
  url-short -o <code>                                   Open in browser
  url-short -l                                          List all
  url-short -d <code>                                 Delete code
  url-short -h                                          Show help
`);
}

async function main() {
    switch (cmd) {
        case "-s": {
            const urlArg = rest.find(x => !x.startsWith("--"));
            if (!urlArg) { console.error("Provide a URL."); process.exit(1); }
            const url = normalizeUrl(urlArg);
            const alias = getFlag("alias");
            const len = Number(getFlag("len", "6"));
            let code = alias ?? genCode(len);

            // ensure uniqueness (regenerate if collision)
            if (alias && dbLink.filter("links", (val)=> val.code === alias).length > 0) {
                console.error(`Alias '${alias}' already exists.`);
                process.exit(2);
            }
            while (!alias && dbLink.filter("links", (val)=> val.code === code).length > 0) {
                code = genCode(len);
            }

            const link: Link = { id: code, code, url, createdAt: new Date().toISOString(), hits: 0 };

            await dbLink.upsert("links", link);
            console.log(code);
            break;
        }

        case "-e": {
            const code = rest.find(x => !x.startsWith("--"));
            if (!code) { console.error("Provide a code."); process.exit(1); }
            const link = dbLink.filter("links", (val)=> (val.code === code));
            if (!link[0]) { console.error("Not found."); process.exit(2); }
            console.log(link[0].url);
            break;
        }

        case "-o": {
            const code = rest.find(x => !x.startsWith("--"));
            if (!code) { console.error("Provide a code."); process.exit(1); }
            const link = dbLink.filter("links", (val)=> (val.code === code));
            if (!link[0]) { console.error("Not found."); process.exit(2); }
            // increment hits
            await dbLink.upsert("links", { ...link[0], hits: link[0].hits + 1 });
            // macOS: open, Linux: xdg-open, Windows: start
            const opener = process.platform === "darwin" ? "open" :
                process.platform === "win32" ? "start" : "xdg-open";
            spawn(opener, [link[0].url], { stdio: "ignore", shell: true });
            console.log(`Opened ${link[0].url}`);
            break;
        }

        case "-l": {
            const links = dbLink.findAll("links");
            if (!links.length) { console.log("(empty)"); return; }
            for (const l of links) {
                console.log(`${l.code}\t${l.url}\t[hits:${l.hits}] [created:${l.createdAt}]`);
            }
            break;
        }

        case "-d": {
            const code = rest.find(x => !x.startsWith("--"));
            if (!code) { console.error("Provide a code."); process.exit(1); }
            const ok = await dbLink.remove("links", code);
            console.log(ok ? "Deleted." : "Not found.");
            break;
        }

        default:
            printHelp();
    }
}

(async ()=> {
    await main();
})()
