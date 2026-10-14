#!/usr/bin/env node
/* =============================================================================
   This worktree's own Storybook, on a port of its own.

     npm run storybook:serve     # start it, or find it running: prints its address
     npm run storybook:stop      # stop the one this worktree started

   `serve` starts `storybook dev` on a port the system gives as free,
   detached from the calling shell into a process group of its own, so any
   step, or a person, can serve and go on. It records what it started in
   `.storybook-serve.json` at the worktree's root (git ignores it), writes
   the server's output to `.storybook-serve.log` beside it, waits until
   `/index.json` answers and prints the address alone on stdout. Run again
   while that server is alive, it prints the same address and starts nothing.

   `stop` signals the process group its own record names, and nothing else:
   never a name, never whatever listens on a port. It waits until the group
   is gone and the port is free, then removes the record.

   A record is this worktree's only while its pid is the process it started.
   On Linux the record also holds the machine's boot id and the process's
   start time, and a record they no longer match (a pid reused after the
   machine restarted) is cleared without a signal. Elsewhere the pid alone is
   trusted.

   The root is the folder above this script, so a copy of it serves the
   folder it is copied into. POSIX only: a process group is how the server's
   children (Vite's among them) are stopped with it. Two `serve` run at the
   same moment in one worktree may each start a server; one session works a
   worktree at a time.

   STORYBOOK_SERVE_TIMEOUT_MS: how long `serve` waits for the server to
   answer (default 180000). The checks shorten it.
   ========================================================================== */

import { spawn } from "node:child_process";
import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { connect, createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const RECORD = join(root, ".storybook-serve.json");
const LOG = join(root, ".storybook-serve.log");
const STORYBOOK = join(root, "node_modules", ".bin", "storybook");
const TIMEOUT = Number(process.env.STORYBOOK_SERVE_TIMEOUT_MS) || 180_000;
const STOP_WAIT = 10_000;
const TRIES = 3;

const say = (line) => process.stderr.write(`${line}\n`);
const sleep = (ms) => new Promise((wake) => setTimeout(wake, ms));

/* --- The record ---------------------------------------------------------- */

const readRecord = () => {
  if (!existsSync(RECORD)) return null;
  try {
    const record = JSON.parse(readFileSync(RECORD, "utf8"));
    return Number.isInteger(record.pid) && record.pid > 0 ? record : {};
  } catch {
    return {};
  }
};

const clearRecord = () => rmSync(RECORD, { force: true });

/** The machine's boot id, on Linux. */
const bootId = () => {
  try {
    return readFileSync("/proc/sys/kernel/random/boot_id", "utf8").trim();
  } catch {
    return undefined;
  }
};

/** When a process started, in clock ticks since boot, on Linux. */
const startTime = (pid) => {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    // The command name, in parentheses, may hold spaces: count from after it.
    return stat.slice(stat.lastIndexOf(")") + 2).split(" ")[19];
  } catch {
    return undefined;
  }
};

const groupAlive = (pid) => {
  try {
    process.kill(-pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
};

/** Whether the record names a group this worktree started that still runs. */
const ours = (record) => {
  if (!record.pid || !groupAlive(record.pid)) return false;
  if (!record.boot) return true;
  if (bootId() !== record.boot) return false;
  // The leader may be gone while its children run: a group's id is not
  // given to another process while the group lives.
  const started = startTime(record.pid);
  return started === undefined || started === record.startTime;
};

/* --- Ports --------------------------------------------------------------- */

/** A port the system gives as free, on every address, as `storybook dev`
    listens when it is given no host. */
const freePort = () =>
  new Promise((done, fail) => {
    const probe = createServer();
    probe.once("error", fail);
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => done(port));
    });
  });

const listening = (port) =>
  new Promise((done) => {
    const socket = connect({ port, host: "localhost" });
    socket.once("connect", () => {
      socket.destroy();
      done(true);
    });
    socket.once("error", () => done(false));
  });

const answers = async (url) => {
  try {
    const response = await fetch(new URL("index.json", url), {
      signal: AbortSignal.timeout(5_000),
    });
    return response.status === 200;
  } catch {
    return false;
  }
};

const logTail = () => {
  try {
    return readFileSync(LOG, "utf8").trimEnd().split("\n").slice(-20).join("\n");
  } catch {
    return "(no log)";
  }
};

/* --- serve --------------------------------------------------------------- */

/** Starts one server on a free port. Resolves the record once it answers,
    `null` when it exited first (the port was taken in between). */
const start = async (deadline) => {
  const port = await freePort();
  const url = `http://localhost:${port}/`;
  const log = openSync(LOG, "w");
  const child = spawn(
    STORYBOOK,
    ["dev", "--port", String(port), "--exact-port", "--ci", "--no-open"],
    // Nothing of the caller's is held: a harness waiting on its command's
    // output would otherwise wait on the server too.
    { cwd: root, detached: true, stdio: ["ignore", log, log] },
  );
  closeSync(log);
  let exited = false;
  child.once("exit", () => (exited = true));
  child.once("error", () => (exited = true));
  child.unref();
  if (!child.pid) return null;

  const record = {
    pid: child.pid,
    port,
    url,
    startedAt: new Date().toISOString(),
    boot: bootId(),
    startTime: startTime(child.pid),
  };
  writeFileSync(RECORD, `${JSON.stringify(record, null, 2)}\n`);

  while (Date.now() < deadline) {
    if (await answers(url)) return record;
    if (exited && !groupAlive(child.pid)) {
      clearRecord();
      return null;
    }
    await sleep(250);
  }
  await killGroup(record);
  clearRecord();
  say(`The Storybook on ${url} did not answer in ${TIMEOUT} ms; it is stopped.`);
  say(logTail());
  process.exit(1);
};

const serve = async () => {
  const record = readRecord();
  if (record && ours(record)) {
    const deadline = Date.now() + TIMEOUT;
    while (!(await answers(record.url))) {
      if (Date.now() > deadline || !groupAlive(record.pid)) {
        say(`The Storybook recorded on ${record.url} (pid ${record.pid}) does not answer.`);
        say("Run `npm run storybook:stop`, then serve again.");
        process.exit(1);
      }
      await sleep(250);
    }
    say(`This worktree's Storybook is already running (pid ${record.pid}).`);
    process.stdout.write(`${record.url}\n`);
    return;
  }
  if (record) {
    clearRecord();
    say(`Cleared a record naming a Storybook that no longer runs (pid ${record.pid ?? "?"}).`);
  }

  const deadline = Date.now() + TIMEOUT;
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    say("Starting this worktree's Storybook…");
    const started = await start(deadline);
    if (started) {
      say(`Serving on ${started.url} (pid ${started.pid}). Stop it with \`npm run storybook:stop\`.`);
      process.stdout.write(`${started.url}\n`);
      return;
    }
  }
  say(`The Storybook exited before it answered, ${TRIES} times.`);
  say(logTail());
  process.exit(1);
};

/* --- stop ---------------------------------------------------------------- */

/** Signals the recorded group, and kills it if it outlives the wait. True
    once the group is gone and its port is free. */
const killGroup = async ({ pid, port }) => {
  const gone = async (until) => {
    while (Date.now() < until) {
      if (!groupAlive(pid) && !(port && (await listening(port)))) return true;
      await sleep(100);
    }
    return false;
  };
  for (const signal of ["SIGTERM", "SIGKILL"]) {
    try {
      process.kill(-pid, signal);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
    if (await gone(Date.now() + STOP_WAIT)) return true;
  }
  return false;
};

const stop = async () => {
  const record = readRecord();
  if (!record) {
    console.log("Nothing to stop: no Storybook is recorded for this worktree.");
    return;
  }
  if (!ours(record)) {
    clearRecord();
    console.log(
      `Cleared the record: the Storybook it named (pid ${record.pid ?? "?"}) no longer runs. Nothing was stopped.`,
    );
    return;
  }
  if (!(await killGroup(record))) {
    say(`Port ${record.port} still answers after the Storybook (pid ${record.pid}) was killed; the record is kept.`);
    process.exit(1);
  }
  clearRecord();
  console.log(`Stopped the Storybook on ${record.url} (pid ${record.pid}); port ${record.port} is free.`);
};

/* --- main ---------------------------------------------------------------- */

const command = process.argv[2];
if (process.platform === "win32") {
  say("storybook-serve.mjs needs POSIX process groups; on Windows, run `npm run storybook`.");
  process.exit(2);
}
if (command === "serve") await serve();
else if (command === "stop") await stop();
else {
  say("usage: node scripts/storybook-serve.mjs <serve|stop>");
  process.exit(2);
}
