/**
 * Deterministic sequencing test for startMirroredRecording (no camera).
 *
 * Proves with a manual clock that:
 *  1. the encoder never starts before the first real frame + settle window,
 *  2. onstarted fires exactly once (started or given up),
 *  3. a full 5s countdown fits between encoder start and stop,
 *  4. stop() before start resolves null without hanging.
 *
 * Usage (repo root):  node tools/verify-capture-timing.mjs
 * Node 18+ (uses global Blob). No dependencies.
 */
import assert from 'node:assert/strict';

// ---------- manual clock / task queues ----------
let now = 0;
let rafQueue = [];
let timeouts = [];
let nextTimeoutId = 1;

globalThis.performance = { now: () => now };
globalThis.requestAnimationFrame = (cb) => { rafQueue.push(cb); return rafQueue.length; };
globalThis.cancelAnimationFrame = () => {};
globalThis.setTimeout = (cb, ms) => {
  const id = nextTimeoutId++;
  timeouts.push({ at: now + ms, cb, id });
  return id;
};
globalThis.clearTimeout = (id) => {
  timeouts = timeouts.filter((t) => t.id !== id);
};

const tick = () => new Promise((r) => setImmediate(r));

function pumpRaf(frames = 1) {
  for (let i = 0; i < frames; i++) {
    now += 16;
    const q = rafQueue.splice(0);
    q.forEach((cb) => cb());
  }
}

function advance(ms) {
  const end = now + ms;
  for (;;) {
    const due = timeouts.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0];
    if (!due) break;
    now = due.at;
    timeouts = timeouts.filter((t) => t !== due);
    due.cb();
  }
  now = end;
}

// ---------- browser mocks ----------
let fakeVideoEl = null;

function makeVideoEl() {
  const el = {
    muted: false,
    playsInline: false,
    srcObject: null,
    readyState: 0,
    play: () => Promise.resolve(),
    pause: () => {},
  };
  fakeVideoEl = el;
  return el;
}

const ctx2d = { save: () => {}, restore: () => {}, translate: () => {}, scale: () => {}, drawImage: () => {} };

globalThis.document = {
  createElement: (tag) => {
    if (tag === 'video') return makeVideoEl();
    return {
      width: 0,
      height: 0,
      getContext: () => ctx2d,
      captureStream: () => ({ getVideoTracks: () => [], getAudioTracks: () => [] }),
    };
  },
};

const recorderEvents = [];
const recorderInstances = [];
globalThis.MediaRecorder = class {
  static isTypeSupported = () => false; // force default (webm) path
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.mimeType = 'video/webm';
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onstop = null;
    recorderInstances.push(this);
  }
  start(timeslice) {
    this.state = 'recording';
    recorderEvents.push({ type: 'start', at: now, timeslice });
  }
  emitData() {
    // real MediaRecorder delivers Blobs (which have .size); mirror that
    if (this.ondataavailable) this.ondataavailable({ data: new Blob([new Uint8Array([1, 2, 3])]) });
  }
  stop() {
    this.state = 'inactive';
    recorderEvents.push({ type: 'stop', at: now });
    if (this.onstop) this.onstop();
  }
};

function makeStream() {
  return {
    getVideoTracks: () => [{ getSettings: () => ({ width: 1280, height: 720 }) }],
    getAudioTracks: () => [],
  };
}

const { startMirroredRecording } = await import('../frontend/src/utils/recordVideo.js');

// ---------- scenario 1: full 5s countdown fits inside the recording ----------
{
  recorderEvents.length = 0;
  let startedCalls = 0;
  const handle = startMirroredRecording(makeStream(), {
    settleMs: 2000,
    onstarted: () => { startedCalls++; },
  });
  await tick(); await tick();

  // camera serves nothing yet -> encoder must not start
  pumpRaf(5);
  await tick();
  assert.equal(recorderEvents.length, 0, 'encoder started with no frames');

  // first frame arrives, settle window runs
  fakeVideoEl.readyState = 2;
  pumpRaf(1);
  await tick();
  advance(2000); // settleMs
  await tick(); await tick();
  const startEvt = recorderEvents.find((e) => e.type === 'start');
  assert.ok(startEvt, 'encoder never started after settle');
  const encodeStart = startEvt.at;
  assert.equal(startedCalls, 1, 'onstarted must fire exactly once');

  // the 5s countdown, as CapturePage runs it (5 x 1s ticks)
  const tickTimes = [];
  for (let i = 0; i < 5; i++) {
    advance(1000);
    await tick();
    tickTimes.push(now);
  }
  assert.ok(tickTimes[0] >= encodeStart, 'countdown ticked before encoder start');

  // feed one chunk then stop (flash done)
  recorderInstances[recorderInstances.length - 1].emitData();
  const stopPromise = handle.stop();
  const span = now - encodeStart;
  const blob = await stopPromise;
  console.log(`scenario 1: encode span ${(span / 1000).toFixed(2)}s over 5 countdown ticks`);
  assert.ok(span >= 5000, `clip span ${span}ms < 5000ms countdown`);
  assert.ok(blob && blob.size > 0, 'expected a non-empty blob');
  assert.equal(startedCalls, 1, 'onstarted fired more than once');
  console.log('scenario 1 ok: full 5s countdown fits inside the recording');
}

// ---------- scenario 2: stop() before start resolves null, no hang ----------
{
  recorderEvents.length = 0;
  let startedCalls = 0;
  const handle = startMirroredRecording(makeStream(), {
    settleMs: 2000,
    onstarted: () => { startedCalls++; },
  });
  await tick(); await tick();
  const result = await handle.stop(); // stop while still settling
  pumpRaf(5); // let the pending rAF wait observe running=false (browser does this at 60fps)
  await tick(); await tick();
  assert.equal(result, null, 'early stop must resolve null');
  assert.equal(recorderEvents.filter((e) => e.type === 'start').length, 0, 'encoder started after stop');
  assert.equal(startedCalls, 1, 'onstarted must still fire exactly once on give-up');
  console.log('scenario 2 ok: early stop resolves null, no hang, single onstarted');
}

// ---------- scenario 3: dead camera never stalls (gives up cleanly) ----------
{
  recorderEvents.length = 0;
  let startedCalls = 0;
  const handle = startMirroredRecording(makeStream(), {
    settleMs: 2000,
    onstarted: () => { startedCalls++; },
  });
  await tick(); await tick();
  // readyState stays 0 forever; pump past the first-frame deadline
  pumpRaf(200);
  await tick(); await tick();
  advance(5000);
  await tick(); await tick();
  assert.equal(recorderEvents.filter((e) => e.type === 'start').length, 0, 'encoder started with dead camera');
  assert.equal(startedCalls, 1, 'onstarted must fire on give-up');
  const result = await handle.stop();
  assert.equal(result, null, 'dead-camera stop must resolve null');
  console.log('scenario 3 ok: dead camera gives up cleanly, countdown would proceed to photo fallback');
}

console.log('\nAll capture-timing checks passed.');
