/* =============================================================================
   Rule checks for a worktree's own Storybook (scripts/storybook-serve.mjs)
   and the browser a session works it with (.mcp.json).

     npm run storybook:check     # node's test runner

   Each serve/stop test makes the script speak in a fixture: a temp folder
   holding a copy of the script at `scripts/storybook-serve.mjs` and a
   stand-in `node_modules/.bin/storybook`. The stand-in serves `/index.json`
   on the port it is given, starts one long-lived child into its own process
   group (as Vite does) and appends a line to `started` each time it starts.
   The real dev server is never started here: these checks stay cheap.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPT = join(root, "scripts", "storybook-serve.mjs");
const RECORD = ".storybook-serve.json";
const LOG = ".storybook-serve.log";

/** The stand-in `storybook dev`. `STANDIN_STATUS` sets what `/index.json`
    answers (200 unless told otherwise). */
const standIn = (status = 200) => `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const { spawn } = require("node:child_process");
const http = require("node:http");
const port = Number(process.argv[process.argv.indexOf("--port") + 1]);
appendFileSync("started", process.pid + "\\n");
spawn(process.execPath, ["-e", "setInterval(() => {}, 1e9)"], { stdio: "ignore" });
http
  .createServer((req, res) => {
    res.writeHead(req.url === "/index.json" ? ${status} : 404, { "content-type": "application/json" });
    res.end("{}");
  })
  .listen(port);
`;

/** A folder the script serves, as a worktree would be. */
const fixture = (t, { status } = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "ds-serve-"));
  mkdirSync(join(dir, "scripts"));
  cpSync(SCRIPT, join(dir, "scripts", "storybook-serve.mjs"));
  mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
  const bin = join(dir, "node_modules", ".bin", "storybook");
  writeFileSync(bin, standIn(status));
  chmodSync(bin, 0o755);
  t.after(() => {
    const record = readRecord(dir);
    if (record) killGroup(record.pid);
    rmSync(dir, { recursive: true, force: true });
  });
  return dir;
};

/** Runs the fixture's copy of the script, as `npm run storybook:<command>`. */
const run = (dir, command, env = {}) =>
  new Promise((done) => {
    const child = spawn(
      process.execPath,
      [join(dir, "scripts", "storybook-serve.mjs"), command],
      { cwd: dir, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    // `close` waits for the pipes: a detached server that held one would
    // keep this from ever resolving, and the test would time out.
    child.on("close", (status) => done({ status, stdout, stderr }));
  });

const readRecord = (dir) =>
  existsSync(join(dir, RECORD))
    ? JSON.parse(readFileSync(join(dir, RECORD), "utf8"))
    : null;

const starts = (dir) =>
  existsSync(join(dir, "started"))
    ? readFileSync(join(dir, "started"), "utf8").trim().split("\n").length
    : 0;

const groupAlive = (pid) => {
  try {
    process.kill(-pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    throw error;
  }
};

const killGroup = (pid) => {
  try {
    process.kill(-pid, "SIGKILL");
  } catch {}
};

const answers = async (url) => {
  try {
    return (await fetch(new URL("index.json", url))).status === 200;
  } catch {
    return false;
  }
};

/** Whether anything accepts a connection on the port. */
const listening = (port) =>
  new Promise((done) => {
    const socket = connect({ port, host: "localhost" });
    socket.once("connect", () => {
      socket.destroy();
      done(true);
    });
    socket.once("error", () => done(false));
  });

/** A pid that was a process and is no longer one. */
const deadPid = () =>
  new Promise((done) => {
    const child = spawn(process.execPath, ["-e", "0"], { stdio: "ignore" });
    child.on("exit", () => done(child.pid));
  });

const ADDRESS = /^http:\/\/localhost:(\d+)\/$/;

test("two directories serve at once on two ports; stopping one leaves the other", async (t) => {
  const a = fixture(t);
  const b = fixture(t);
  const [servedA, servedB] = await Promise.all([run(a, "serve"), run(b, "serve")]);
  assert.equal(servedA.status, 0, servedA.stderr);
  assert.equal(servedB.status, 0, servedB.stderr);
  const urlA = servedA.stdout.trim();
  const urlB = servedB.stdout.trim();
  assert.match(urlA, ADDRESS);
  assert.match(urlB, ADDRESS);
  assert.notEqual(urlA, urlB, "each worktree has a port of its own");
  assert.ok(await answers(urlA));
  assert.ok(await answers(urlB));

  const recordA = readRecord(a);
  const recordB = readRecord(b);
  for (const [record, url] of [
    [recordA, urlA],
    [recordB, urlB],
  ]) {
    assert.equal(record.url, url);
    assert.equal(record.port, Number(url.match(ADDRESS)[1]));
    assert.ok(Number.isInteger(record.pid) && record.pid > 0);
  }

  const stopped = await run(a, "stop");
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.match(stopped.stdout, new RegExp(`port ${recordA.port} is free`));
  assert.equal(await listening(recordA.port), false, "A's port is free");
  assert.equal(groupAlive(recordA.pid), false, "A's group, its child too, is gone");
  assert.equal(readRecord(a), null, "A's record is removed");
  assert.ok(await answers(urlB), "B still answers");
});

test("a second serve while one runs prints the same address and starts nothing", async (t) => {
  const dir = fixture(t);
  const first = await run(dir, "serve");
  assert.equal(first.status, 0, first.stderr);
  const { pid } = readRecord(dir);
  const second = await run(dir, "serve");
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);
  assert.equal(starts(dir), 1, "the stand-in started once");
  assert.equal(readRecord(dir).pid, pid);
});

test("stop with no record: nothing to stop, exit 0, nothing started", async (t) => {
  const dir = fixture(t);
  const stopped = await run(dir, "stop");
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.match(stopped.stdout, /Nothing to stop/);
  assert.equal(starts(dir), 0);
  assert.equal(existsSync(join(dir, RECORD)), false);
  assert.equal(existsSync(join(dir, LOG)), false);
});

test("a record whose pid is gone is cleared, by stop and by serve", async (t) => {
  const dir = fixture(t);
  const stale = { pid: await deadPid(), port: 1, url: "http://localhost:1/" };

  writeFileSync(join(dir, RECORD), JSON.stringify(stale));
  const stopped = await run(dir, "stop");
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.match(stopped.stdout, /[Cc]leared/);
  assert.equal(existsSync(join(dir, RECORD)), false);
  assert.equal(starts(dir), 0);

  writeFileSync(join(dir, RECORD), JSON.stringify(stale));
  const served = await run(dir, "serve");
  assert.equal(served.status, 0, served.stderr);
  assert.match(served.stderr, /[Cc]leared/);
  assert.match(served.stdout.trim(), ADDRESS);
  assert.notEqual(served.stdout.trim(), stale.url);
  assert.equal(starts(dir), 1);
  assert.ok(await answers(served.stdout.trim()));
});

/** A stand-in server no fixture recorded, in a group of its own. */
const unrelated = async (t) => {
  const dir = fixture(t);
  const port = 20000 + Math.floor(Math.random() * 20000);
  const child = spawn(join(dir, "node_modules", ".bin", "storybook"), ["dev", "--port", String(port)], {
    cwd: dir,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  t.after(() => killGroup(child.pid));
  const url = `http://localhost:${port}/`;
  for (let i = 0; i < 100 && !(await answers(url)); i++)
    await new Promise((wait) => setTimeout(wait, 50));
  assert.ok(await answers(url), "the unrelated server is up");
  return { pid: child.pid, port, url };
};

test("stop kills by the recorded group only", async (t) => {
  const other = await unrelated(t);
  const dir = fixture(t);
  const served = await run(dir, "serve");
  assert.equal(served.status, 0, served.stderr);
  const stopped = await run(dir, "stop");
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.ok(await answers(other.url), "the unrelated server still answers");
  assert.ok(groupAlive(other.pid));
});

test(
  "a record naming a pid another process now holds is cleared, never signalled",
  { skip: process.platform !== "linux" && "the start-time guard reads /proc" },
  async (t) => {
    const dir = fixture(t);
    const served = await run(dir, "serve");
    assert.equal(served.status, 0, served.stderr);
    const ours = readRecord(dir);
    killGroup(ours.pid);
    // The pid is reused: the record now names a live group this worktree
    // did not start, as after a restart of the machine.
    const other = await unrelated(t);
    writeFileSync(join(dir, RECORD), JSON.stringify({ ...ours, pid: other.pid, port: other.port, url: other.url }));

    const stopped = await run(dir, "stop");
    assert.equal(stopped.status, 0, stopped.stderr);
    assert.match(stopped.stdout, /[Cc]leared/);
    assert.equal(readRecord(dir), null);
    assert.ok(groupAlive(other.pid), "the other group was not signalled");
    assert.ok(await answers(other.url));

    writeFileSync(join(dir, RECORD), JSON.stringify({ ...ours, pid: other.pid, port: other.port, url: other.url }));
    const reserved = await run(dir, "serve");
    assert.equal(reserved.status, 0, reserved.stderr);
    assert.notEqual(reserved.stdout.trim(), other.url, "serve starts its own");
    assert.ok(groupAlive(other.pid));
  },
);

test("a server that never answers: serve fails, stops what it started, leaves no record", async (t) => {
  const dir = fixture(t, { status: 500 });
  const served = await run(dir, "serve", { STORYBOOK_SERVE_TIMEOUT_MS: "1500" });
  assert.equal(served.status, 1);
  assert.equal(served.stdout, "");
  assert.equal(readRecord(dir), null);
  const pid = Number(readFileSync(join(dir, "started"), "utf8").trim());
  assert.equal(groupAlive(pid), false, "what it started is stopped");
  assert.match(served.stderr, /did not answer/);
});

test("the browser server is the one .mcp.json names, and lists its tools", async (t) => {
  const { playwright } = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers;
  assert.ok(playwright, ".mcp.json names a `playwright` server");
  // Claude Code expands `${VAR:-default}` in .mcp.json; so does this test.
  const expand = (text) =>
    text.replace(/\$\{(\w+)(?::-([^}]*))?\}/g, (_, name, fallback = "") => process.env[name] || fallback);
  const args = playwright.args.map(expand);
  assert.ok(args.includes("--headless"));
  assert.ok(args.includes("--isolated"));
  const outputDir = args[args.indexOf("--output-dir") + 1];
  assert.ok(outputDir && isAbsolute(outputDir), "an absolute output directory");
  assert.ok(relative(root, resolve(root, outputDir)).startsWith(".."), "the output directory is outside the tree");

  const { devDependencies } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.match(devDependencies["@playwright/mcp"] ?? "", /^\d+\.\d+\.\d+$/, "@playwright/mcp is pinned exactly");

  const server = spawn(expand(playwright.command), args, { cwd: root, stdio: ["pipe", "pipe", "pipe"] });
  t.after(() => server.kill("SIGKILL"));
  const replies = new Map();
  let buffer = "";
  let waiting = null;
  server.stdout.on("data", (chunk) => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.id !== undefined) replies.set(message.id, message);
      waiting?.();
    }
  });
  const ask = async (id, method, params = {}) => {
    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    const deadline = Date.now() + 30_000;
    while (!replies.has(id)) {
      assert.ok(Date.now() < deadline, `no answer to ${method}`);
      await new Promise((wake) => {
        waiting = wake;
        setTimeout(wake, 200);
      });
    }
    return replies.get(id);
  };

  await ask(1, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "storybook-serve.check", version: "0" },
  });
  server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
  const listed = await ask(2, "tools/list");
  const names = listed.result.tools.map((tool) => tool.name);
  for (const name of [
    "browser_navigate",
    "browser_click",
    "browser_type",
    "browser_press_key",
    "browser_hover",
    "browser_snapshot",
  ])
    assert.ok(names.includes(name), `the server offers ${name}`);
});

test("the script refuses an unknown command", () => {
  const { status, stderr } = spawnSync(process.execPath, [SCRIPT, "start"], { encoding: "utf8" });
  assert.equal(status, 2);
  assert.match(stderr, /storybook-serve\.mjs <serve\|stop>/);
});
