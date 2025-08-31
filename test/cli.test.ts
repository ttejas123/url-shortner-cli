import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const CLI = path.resolve(__dirname, "../dist/index.js");

function makeTempHome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "urlshort-cli-"));
  process.env.HOME = dir;
  process.env.USERPROFILE = dir;
  return dir;
}

function runCli(args: string[], env: NodeJS.ProcessEnv = {}) {
  const res = spawnSync(process.execPath, [CLI, ...args], {
    env: { ...process.env, ...env },
    encoding: "utf8"
  });
  return res;
}

let tempHome: string;

beforeEach(() => {
  tempHome = makeTempHome();
});

afterEach(() => {
  try { fs.rmSync(tempHome, { recursive: true, force: true }); } catch {}
});

describe("CLI basic flows", () => {
  it("shows help by default", () => {
    const { stdout, status } = runCli([]);
    expect(status).toBe(0);
    expect(stdout).toMatch(/Usage:\s*\n/);
  });

  it("creates, echoes, lists and deletes an alias", () => {
    // create with alias
    let res = runCli(["-s", "example.com", "--alias", "myc", "--len", "6"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("myc");

    // echo original url
    res = runCli(["-e", "myc"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("https://example.com/");

    // list has one entry
    res = runCli(["-l"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/^myc\thttps:\/\/example.com\//);

    // delete
    res = runCli(["-d", "myc"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("Deleted.");

    // list now empty
    res = runCli(["-l"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("(empty)");
  });

  it("prevents duplicate alias", () => {
    let res = runCli(["-s", "example.com", "--alias", "dup"]);
    expect(res.status).toBe(0);

    res = runCli(["-s", "example.com", "--alias", "dup"]);
    expect(res.status).toBe(2);
    expect(res.stderr).toMatch(/already exists/);
  });

  it("opens url and increments hits using stubbed opener", () => {
    // prepare entry
    let res = runCli(["-s", "example.com", "--alias", "opn"]);
    expect(res.status).toBe(0);

    // Create a stub opener in PATH
    const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "urlshort-open-"));
    const openerName = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    const scriptPath = path.join(binDir, openerName);
    fs.writeFileSync(scriptPath, `#!/usr/bin/env bash\nexit 0\n`, { mode: 0o755 });

    res = runCli(["-o", "opn"], { PATH: `${binDir}:${process.env.PATH}` });
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Opened https:\/\/example.com\//);

    // hits should be 1 now; list output includes hits
    res = runCli(["-l"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/\[hits:1\]/);
  });

  it("validates arguments and shows errors", () => {
    let res = runCli(["-s"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/Provide a URL/);

    res = runCli(["-e"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/Provide a code/);

    res = runCli(["-d"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/Provide a code/);

    res = runCli(["-e", "nope"]);
    expect(res.status).toBe(2);
    expect(res.stderr).toMatch(/Not found/);
  });
});
