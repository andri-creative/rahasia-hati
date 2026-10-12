'use strict';

/* ============================================================
   RAHASIA HATI 🌸 — Game Engine 22 Babak · 2 Sesi
   ============================================================ */

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const isHttp = location.protocol.startsWith('http');
const SCENE_KEY = 'rahasia-hati-scene';
const TOTAL_SCENES = 22;
const SESSION_END = 11;

/* ---------------- STATE ---------------- */
function defaultState() {
  return {
    currentScene: 1,
    musicMuted: false,
    audioUnlocked: false,
    trackIdx: 0,
    /* 1 */ jarOpens: 0,
    /* 2 */ unwrap: 0,
    /* 3 */ ribbon: 0,
    /* 4 */ strokes: 0,
    /* 5 */ caught: 0, melted: 0,
    /* 6 */ scarf: 0,
    /* 7 */ lampOn: false, walk: 0,
    /* 8 */ pulls: 0,
    /* 9 */ patched: false,
    /* 10 */ charge: 0,
    /* 11 */ stamps: 0,
    /* 12 */ umbOpen: false, gap: 74,
    /* 13 */ mallows: 0,
    /* 14 */ sheets: 0,
    /* 15 */ pinch: 0,
    /* 16 */ crank: 0,
    /* 17 */ stars: 0,
    /* 18 */ sparks: 0,
    /* 19 */ hold: 0,
    /* 20 */ unlocked: false,
    /* 21 */ letterDone: false
  };
}
let STATE = defaultState();

/* ---------------- Toast, haptic, floater ---------------- */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
function vibrate(p) { if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }

function spawnFloaters(n, chars) {
  const pool = chars || ['💗', '🌸', '✨', '♥', '⭐'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'float-heart';
    el.textContent = pool[Math.floor(Math.random() * pool.length)];
    el.style.left = rand(8, 88) + 'vw';
    el.style.top = rand(55, 88) + 'vh';
    el.style.animationDelay = (i * 80) + 'ms';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}

/* timer yang dibersihkan saat ganti babak */
let sceneTimers = [];
function later(fn, ms) { const t = setTimeout(fn, ms); sceneTimers.push(t); return t; }
function every(fn, ms) { const t = setInterval(fn, ms); sceneTimers.push(t); return t; }
function clearSceneTimers() { sceneTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); sceneTimers = []; }

/* ============================================================
   SOUND ENGINE — Web Audio API
   ============================================================ */
const A = {
  ctx: null, master: null, noiseBuf: null,
  mp3Ok: false, mp3Mode: false, mp3Failed: false, synthOn: false,
  schedTimer: null, step: 0, nextTime: 0, stepDur: 0.5, mediaSrc: null,
  trackIdx: 0, nameTimer: null
};

function ensureAudio() {
  if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx; }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  A.ctx = new Ctx();
  A.master = A.ctx.createGain();
  A.master.gain.value = 0.7;
  A.master.connect(A.ctx.destination);
  const len = Math.floor(A.ctx.sampleRate * 1.4);
  A.noiseBuf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
  const d = A.noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return A.ctx;
}

function env(g, t, peak, atk, dec) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
}
function blip(freq, dur, type, peak, atk) {
  const ctx = ensureAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type || 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  env(g, t, peak || 0.18, atk || 0.01, dur);
  o.connect(g); g.connect(A.master);
  o.start(t); o.stop(t + dur + 0.05);
}

/* ---- SFX sesuai plan ---- */
function sfxChime() {                 /* denting kristal */
  const ctx = ensureAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  [1318.51, 1760, 2637.02].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const g = ctx.createGain();
    const st = t + i * 0.06;
    env(g, st, 0.1, 0.015, 1.1);
    o.connect(g); g.connect(A.master);
    o.start(st); o.stop(st + 1.2);
  });
}
function sfxPop() {                    /* soft pop */
  const ctx = ensureAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(560, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.13);
  const g = ctx.createGain();
  env(g, t, 0.2, 0.008, 0.16);
  o.connect(g); g.connect(A.master);
  o.start(t); o.stop(t + 0.2);
}
function sfxGiggle() {                 /* giggle chime manja */
  const ctx = ensureAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  [659.25, 783.99, 987.77, 1174.66].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const g = ctx.createGain();
    const st = t + i * 0.085;
    env(g, st, 0.13, 0.01, 0.45);
    o.connect(g); g.connect(A.master);
    o.start(st); o.stop(st + 0.55);
  });
}
function sfxHeart(tempo) {             /* detak jantung */
  const ctx = ensureAudio(); if (!ctx) return;
  const beat = (off, f) => {
    const t = ctx.currentTime + off;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.16);
    const g = ctx.createGain();
    env(g, t, 0.34, 0.01, 0.2);
    o.connect(g); g.connect(A.master);
    o.start(t); o.stop(t + 0.24);
  };
  beat(0, 96); beat(tempo || 0.26, 82);
}
function sfxPaper() {                  /* kertas berderak */
  const ctx = ensureAudio(); if (!ctx || !A.noiseBuf) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = A.noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1400;
  const g = ctx.createGain();
  env(g, t, 0.09, 0.02, 0.34);
  src.connect(f); f.connect(g); g.connect(A.master);
  src.start(t); src.stop(t + 0.4);
}
function sfxBell() {                   /* lonceng ting-ting */
  blip(1567.98, 0.5, 'sine', 0.16, 0.006);
  setTimeout(() => blip(2093, 0.6, 'sine', 0.13, 0.006), 140);
}
function sfxStamp() {
  const ctx = ensureAudio(); if (!ctx || !A.noiseBuf) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = A.noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
  const g = ctx.createGain();
  env(g, t, 0.3, 0.004, 0.16);
  src.connect(f); f.connect(g); g.connect(A.master);
  src.start(t); src.stop(t + 0.2);
  blip(140, 0.2, 'sine', 0.2, 0.005);
}
function sfxUnlock() {
  sfxPop();
  setTimeout(() => sfxChime(), 240);
}
function sfxSpark() {                  /* percikan api */
  const ctx = ensureAudio(); if (!ctx || !A.noiseBuf) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = A.noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 1.4;
  const g = ctx.createGain();
  env(g, t, 0.1, 0.005, 0.28);
  src.connect(f); f.connect(g); g.connect(A.master);
  src.start(t); src.stop(t + 0.32);
}
function sfxWisp() {                   /* desir lembut */
  const ctx = ensureAudio(); if (!ctx || !A.noiseBuf) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = A.noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
  f.frequency.setValueAtTime(360, t);
  f.frequency.linearRampToValueAtTime(900, t + 1.1);
  const g = ctx.createGain();
  env(g, t, 0.03, 0.4, 1.6);
  src.connect(f); f.connect(g); g.connect(A.master);
  src.start(t); src.stop(t + 1.7);
}
function sfxMelody() {                 /* kotak musik kristal */
  const ctx = ensureAudio(); if (!ctx) return;
  const t0 = ctx.currentTime;
  const notes = ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'C5'];
  const hz = (n) => {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1][0]];
    const midi = base + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  notes.forEach((n, i) => {
    const t = t0 + i * 0.24;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(n);
    const g = ctx.createGain();
    env(g, t, 0.12, 0.01, 0.7);
    o.connect(g); g.connect(A.master);
    o.start(t); o.stop(t + 0.8);
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = hz(n) * 2;
    const g2 = ctx.createGain();
    env(g2, t, 0.04, 0.01, 0.5);
    o2.connect(g2); g2.connect(A.master);
    o2.start(t); o2.stop(t + 0.6);
  });
}

/* ---- Musik: 3 lagu synth ---- */
function noteHz(n) {
  const m = /^([A-G]#?)(-?\d)$/.exec(n);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1][0]];
  const midi = base + (m[1][1] === '#' ? 1 : 0) + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const TRACKS = [
  {
    name: 'Rahasia Hati', bpm: 70,
    arps: [
      ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
      ['G2', 'D3', 'G3', 'B3', 'D4', 'B3', 'G3', 'D3'],
      ['A2', 'E3', 'A3', 'C4', 'E4', 'C4', 'A3', 'E3'],
      ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3']
    ],
    pads: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']],
    mel: [
      { t: 0, n: 'E5', d: 2 }, { t: 2, n: 'D5', d: 2 }, { t: 4, n: 'C5', d: 4 },
      { t: 8, n: 'D5', d: 2 }, { t: 10, n: 'E5', d: 2 }, { t: 12, n: 'D5', d: 4 },
      { t: 16, n: 'A4', d: 2 }, { t: 18, n: 'C5', d: 2 }, { t: 20, n: 'E5', d: 4 },
      { t: 24, n: 'D5', d: 2 }, { t: 26, n: 'C5', d: 2 }, { t: 28, n: 'B4', d: 4 },
      { t: 32, n: 'C5', d: 3 }, { t: 35, n: 'E5', d: 1 }, { t: 36, n: 'G5', d: 4 },
      { t: 40, n: 'F5', d: 2 }, { t: 42, n: 'E5', d: 2 }, { t: 44, n: 'C5', d: 4 },
      { t: 48, n: 'D5', d: 2 }, { t: 50, n: 'C5', d: 2 }, { t: 52, n: 'B4', d: 4 },
      { t: 56, n: 'A4', d: 4 }, { t: 60, n: 'C5', d: 4 }
    ]
  },
  {
    name: 'Lentera Senja', bpm: 64,
    arps: [
      ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'],
      ['G2', 'D3', 'G3', 'B3', 'D4', 'B3', 'G3', 'D3'],
      ['E2', 'B2', 'E3', 'G3', 'B3', 'G3', 'E3', 'B2'],
      ['A2', 'E3', 'A3', 'C4', 'E4', 'C4', 'A3', 'E3']
    ],
    pads: [['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['E3', 'G3', 'B3'], ['A3', 'C4', 'E4']],
    mel: [
      { t: 0, n: 'A4', d: 3 }, { t: 3, n: 'C5', d: 3 }, { t: 6, n: 'B4', d: 2 },
      { t: 8, n: 'A4', d: 2 }, { t: 10, n: 'G4', d: 2 }, { t: 12, n: 'F4', d: 4 },
      { t: 16, n: 'G4', d: 2 }, { t: 18, n: 'B4', d: 2 }, { t: 20, n: 'D5', d: 4 },
      { t: 24, n: 'B4', d: 2 }, { t: 26, n: 'G4', d: 2 }, { t: 28, n: 'E4', d: 4 },
      { t: 32, n: 'E4', d: 2 }, { t: 34, n: 'G4', d: 2 }, { t: 36, n: 'B4', d: 4 },
      { t: 40, n: 'C5', d: 2 }, { t: 42, n: 'B4', d: 2 }, { t: 44, n: 'A4', d: 4 },
      { t: 48, n: 'A4', d: 2 }, { t: 50, n: 'C5', d: 2 }, { t: 52, n: 'E5', d: 4 },
      { t: 56, n: 'D5', d: 4 }, { t: 60, n: 'C5', d: 4 }
    ]
  },
  {
    name: 'Janji Selamanya', bpm: 76,
    arps: [
      ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
      ['E2', 'B2', 'E3', 'G3', 'B3', 'G3', 'E3', 'B2'],
      ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'],
      ['G2', 'D3', 'G3', 'B3', 'D4', 'B3', 'G3', 'D3']
    ],
    pads: [['C4', 'E4', 'G4'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']],
    mel: [
      { t: 0, n: 'G4', d: 2 }, { t: 2, n: 'A4', d: 2 }, { t: 4, n: 'C5', d: 4 },
      { t: 8, n: 'B4', d: 2 }, { t: 10, n: 'G4', d: 2 }, { t: 12, n: 'E4', d: 4 },
      { t: 16, n: 'F4', d: 2 }, { t: 18, n: 'A4', d: 2 }, { t: 20, n: 'C5', d: 4 },
      { t: 24, n: 'B4', d: 2 }, { t: 26, n: 'G4', d: 2 }, { t: 28, n: 'D5', d: 4 },
      { t: 32, n: 'E5', d: 3 }, { t: 35, n: 'D5', d: 1 }, { t: 36, n: 'C5', d: 4 },
      { t: 40, n: 'A4', d: 2 }, { t: 42, n: 'C5', d: 2 }, { t: 44, n: 'E5', d: 4 },
      { t: 48, n: 'D5', d: 2 }, { t: 50, n: 'B4', d: 2 }, { t: 52, n: 'G4', d: 4 },
      { t: 56, n: 'C5', d: 4 }, { t: 60, n: 'D5', d: 4 }
    ]
  }
];

function pianoHz(freq, time, dur, vel) {
  const ctx = A.ctx;
  const g = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(2600, time);
  filt.frequency.exponentialRampToValueAtTime(850, time + dur);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(vel, time + 0.014);
  g.gain.exponentialRampToValueAtTime(vel * 0.3, time + Math.min(0.7, dur * 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  g.connect(filt); filt.connect(A.master);
  const mk = (ratio, type, mul, detune) => {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = freq * ratio;
    if (detune) o.detune.value = detune;
    const og = ctx.createGain(); og.gain.value = mul;
    o.connect(og); og.connect(g);
    o.start(time); o.stop(time + dur + 0.15);
  };
  mk(1, 'sine', 1, 0);
  mk(2.002, 'sine', 0.2, 4);
  mk(0.999, 'triangle', 0.15, -5);
}
function padHz(freq, time, dur, vel) {
  const ctx = A.ctx;
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(vel, time + dur * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, time + dur);
  o.connect(g); g.connect(A.master);
  o.start(time); o.stop(time + dur + 0.1);
}
function bellHz(freq, time, vel) {
  const ctx = A.ctx;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(vel, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 2.4);
  g.connect(A.master);
  [1, 2.76, 5.4].forEach((r, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq * r;
    const og = ctx.createGain(); og.gain.value = 1 / (i + 1.6);
    o.connect(og); og.connect(g);
    o.start(time); o.stop(time + 2.5);
  });
}

function musicTick() {
  if (!A.synthOn || !A.ctx) return;
  const T = TRACKS[A.trackIdx];
  const now = A.ctx.currentTime;
  while (A.nextTime < now + 0.3) {
    const step = A.step;
    const t = A.nextTime;
    const ch = step % 4;
    pianoHz(noteHz(T.arps[ch][step % 8]), t, 1.7, 0.05);
    if (step % 8 === 0) T.pads[ch].forEach(n => padHz(noteHz(n), t, A.stepDur * 8 * 1.1, 0.013));
    const ev = T.mel.find(m => m.t === step);
    if (ev) pianoHz(noteHz(ev.n), t, ev.d * A.stepDur * 1.9, 0.12);
    if (step % 32 === 0) bellHz(noteHz(T.arps[ch][2]) * 2, t, 0.05);
    if (step % 16 === 0) sfxWisp();
    A.step = (step + 1) % 64;
    A.nextTime += A.stepDur;
  }
}
function startSynth() {
  const ctx = ensureAudio(); if (!ctx || A.synthOn) return;
  A.synthOn = true; A.mp3Mode = false;
  A.step = 0;
  A.stepDur = 60 / TRACKS[A.trackIdx].bpm / 2;
  A.nextTime = ctx.currentTime + 0.12;
  A.schedTimer = setInterval(musicTick, 90);
  updateMusicUI(true);
}
function stopSynth() {
  A.synthOn = false;
  clearInterval(A.schedTimer);
}
function switchTrack(dir) {
  A.trackIdx = (A.trackIdx + dir + TRACKS.length) % TRACKS.length;
  STATE.trackIdx = A.trackIdx;
  if (A.synthOn) { stopSynth(); startSynth(); }
  updateMusicUI(A.synthOn || A.mp3Mode);
  showToast('🎵 ' + TRACKS[A.trackIdx].name);
}
function probeMp3() {
  if (!isHttp || typeof fetch !== 'function') return Promise.resolve(false);
  return fetch('assets/hidden_love_theme.mp3', { method: 'HEAD' })
    .then(r => { A.mp3Ok = r.ok; return A.mp3Ok; })
    .catch(() => { A.mp3Ok = false; return false; });
}
function tryMp3() {
  if (A.mp3Failed) return Promise.resolve(false);
  if (!isHttp) return Promise.resolve(false);
  return probeMp3().then(ok => {
    if (!ok) { A.mp3Failed = true; return false; }
    const audio = $('bg-audio');
    ensureAudio();
    if (A.ctx && !A.mediaSrc) {
      try { A.mediaSrc = A.ctx.createMediaElementSource(audio); A.mediaSrc.connect(A.master); }
      catch (e) { A.mediaSrc = null; }
    }
    const p = audio.play();
    if (!p || typeof p.then !== 'function') { A.mp3Failed = true; return false; }
    return p.then(() => {
      A.mp3Mode = true; A.mp3Ok = true; stopSynth(); updateMusicUI(true); return true;
    }).catch(() => { A.mp3Failed = true; A.mp3Mode = false; return false; });
  }).catch(() => { A.mp3Failed = true; return false; });
}
function startMusic() {
  STATE.musicMuted = false;
  ensureAudio();
  tryMp3().then(ok => { if (!ok && !STATE.musicMuted) startSynth(); });
  updateMusicUI(true);
}
function stopMusic() {
  STATE.musicMuted = true;
  stopSynth();
  $('bg-audio').pause();
  updateMusicUI(false);
}
function toggleMusic() {
  if (A.synthOn || A.mp3Mode) stopMusic(); else startMusic();
}

function updateMusicUI(playing) {
  const pill = $('music-pill');
  pill.classList.toggle('playing', playing);
  $('music-label').textContent = playing ? 'Musik aktif' : 'Musik';
  const fmPlay = $('fm-play');
  if (fmPlay) fmPlay.textContent = playing ? '⏸' : '▶';
  const fmName = $('fm-name');
  if (fmName) fmName.textContent = TRACKS[A.trackIdx].name;
}
function unlockAudio() {
  if (STATE.audioUnlocked) return;
  STATE.audioUnlocked = true;
  ensureAudio();
  if (!STATE.musicMuted) {
    tryMp3().then(ok => { if (!ok && !STATE.musicMuted) startSynth(); });
  }
}

/* ============================================================
   HELPER INTERAKSI (pointer / scrub / drag / hold)
   ============================================================ */
function onPointer(el, h) {
  if (!el) return;
  let active = false;
  el.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    active = true;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    h.down && h.down(e);
  });
  el.addEventListener('pointermove', e => { if (active) h.move && h.move(e); });
  const end = e => { if (!active) return; active = false; h.up && h.up(e); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

function makeScrub(el, opt) {
  let acc = 0, last = null, done = false;
  const fire = () => opt.onProgress && opt.onProgress(clamp(acc / opt.need, 0, 1));
  onPointer(el, {
    down: e => { last = { x: e.clientX, y: e.clientY }; unlockAudio(); },
    move: e => {
      if (!last || done) return;
      const d = Math.abs(e.clientX - last.x) + Math.abs(e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      acc = Math.min(opt.need, acc + d);
      fire();
      if (acc / opt.need >= 1) { done = true; opt.onDone && opt.onDone(); }
    },
    up: () => { last = null; }
  });
  return { reset() { acc = 0; done = false; fire(); } };
}

function makeDrag(el, h) {
  let sx = 0, sy = 0, on = false;
  onPointer(el, {
    down: e => { on = true; sx = e.clientX; sy = e.clientY; el.classList.add('dragging'); unlockAudio(); h.down && h.down(e); },
    move: e => { if (on) h.move && h.move(e.clientX - sx, e.clientY - sy, e); },
    up: e => { if (!on) return; on = false; el.classList.remove('dragging'); h.up && h.up(e.clientX - sx, e.clientY - sy, e); }
  });
}

function overlaps(a, b, pad) {
  const p = pad || 0;
  return !(a.right - p < b.left || a.left + p > b.right || a.bottom - p < b.top || a.top + p > b.bottom);
}

function makeHold(el, ms, h) {
  let raf = null, start = 0, holding = false;
  const tick = () => {
    if (!holding) return;
    const p = clamp((performance.now() - start) / ms, 0, 1);
    h.onProgress && h.onProgress(p);
    if (p >= 1) { holding = false; h.onDone && h.onDone(); return; }
    raf = requestAnimationFrame(tick);
  };
  const down = e => {
    if (e && e.cancelable) e.preventDefault();
    holding = true; start = performance.now();
    h.onStart && h.onStart();
    raf = requestAnimationFrame(tick);
    unlockAudio();
  };
  const up = () => {
    if (!holding) return;
    holding = false; cancelAnimationFrame(raf);
    h.onCancel && h.onCancel();
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
}

function revealQuote(n) {
  const q = $('q-' + n);
  if (q) q.classList.add('shown');
  spawnFloaters(5);
}
function finishScene(n) {
  revealQuote(n);
  $('btn-' + n + '-next').classList.remove('hidden');
  vibrate([18, 40, 26]);
}

/* ============================================================
   SCENE ENGINE
   ============================================================ */

function showScene(n) {
  const cur = document.querySelector('.scene.active');
  if (cur) { cur.classList.remove('active'); cur.style.animation = ''; }
  STATE.currentScene = n;
  try { localStorage.setItem(SCENE_KEY, String(n)); } catch (e) {}
  const el = $('scene-' + n);
  el.classList.add('active');
  $('stage').scrollTop = 0;
  onSceneEnter(n);
  spawnFloaters(3);
}

function nextScene() {
  const next = STATE.currentScene + 1;
  if (next > TOTAL_SCENES) return;
  clearSceneTimers();
  sfxPop();

  if (STATE.currentScene === SESSION_END) {
    $('session-break').classList.remove('hidden');
    vibrate([30, 60, 30]);
    return;
  }
  showScene(next);
}

function onSceneEnter(n) {
  if (n === 3) resetNotebook();
  if (n === 5) startIceCream();
  if (n === 7) syncLamp();
  if (n === 14) resetSketch();
  if (n === 17) resetConstellation();
  if (n === 18) resetSparkler();
  if (n === 19) resetHeart();
  if (n === 21) resetLetter();
  if (n === 22) enterFinale();
  if (n !== 22) exitFinale();
}

/* ============================================================
   SESI 1 — BABAK 1: TOPLES BINTANG
   ============================================================ */
function initScene1() {
  const jar = $('jar'), stage = document.querySelector('.jar-stage');
  const tap = () => {
    if (STATE.jarOpens >= 3) return;
    STATE.jarOpens++;
    jar.classList.add('open');
    sfxChime();
    vibrate(12);

    const star = document.createElement('span');
    star.className = 'fly-star';
    star.style.left = 'calc(50% - 17px)';
    star.style.top = '40px';
    stage.appendChild(star);
    const dx = rand(-90, 90), dy = rand(-190, -120);
    star.animate([
      { transform: 'translate(0,0) rotate(0) scale(.5)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rand(180, 420)}deg) scale(1.15)`, opacity: 0 }
    ], { duration: 1700, easing: 'cubic-bezier(.22,1,.36,1)' });
    setTimeout(() => star.remove(), 1750);

    $('st-1').textContent = 'Bintang keluar: ' + STATE.jarOpens + '/3';
    if (STATE.jarOpens >= 3) {
      jar.classList.add('done');
      $('jar-hint').textContent = 'rahasia pertama terbang ☁';
      showToast('Bintang pertamaku terbang kepadamu 🌟');
      finishScene(1);
    } else {
      setTimeout(() => jar.classList.remove('open'), 700);
    }
  };
  jar.addEventListener('click', tap);
  jar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
}

/* ============================================================
   BABAK 2: PERMEN SUSU (unwrapping)
   ============================================================ */
function initScene2() {
  const candy = $('candy');
  makeScrub(candy, {
    need: 300,
    onProgress: p => {
      STATE.unwrap = p;
      candy.style.setProperty('--u', p.toFixed(3));
      $('scrub-2').style.width = (p * 100) + '%';
      $('st-2').textContent = p >= 1 ? 'Bungkus terbuka!' : 'Bungkus masih rapat · ' + Math.round(p * 100) + '%';
      if (p > 0 && p < 1 && Math.random() < 0.12) sfxPaper();
    },
    onDone: () => {
      candy.classList.add('done');
      sfxPop(); sfxGiggle();
      showToast('Manisnya... persis seperti kamu 🍬');
      finishScene(2);
    }
  });
}

/* ============================================================
   BABAK 3: CATATAN RAHASIA (pembatas pita)
   ============================================================ */
const NB_TEXT = 'Hari itu kamu tersenyum padaku, dan otakku mendadak lupa cara bernapas. Aku menulisnya di sini supaya tidak pernah hilang...';
const NB_STATE = { sx: null, p: 0, base: 0, done: false, need: 120 };
function resetNotebook() {
  const nb = $('notebook'), rib = $('nb-ribbon');
  NB_STATE.sx = null; NB_STATE.p = 0; NB_STATE.base = 0; NB_STATE.done = false; NB_STATE.need = 120;
  nb.classList.remove('open');
  rib.style.transform = '';
  rib.style.opacity = '';
  $('nb-hand').textContent = '';
  $('scrub-3').style.width = '0%';
  $('st-3').textContent = 'Pembatas pita: 0%';
  $('btn-3-next').classList.add('hidden');
  STATE.ribbon = 0;
}
function initScene3() {
  const nb = $('notebook'), rib = $('nb-ribbon'), S = NB_STATE;
  const roomOf = x => Math.max(60, Math.min(120, window.innerWidth - x - 16));
  const render = () => {
    rib.style.transform = 'translateX(' + (S.p * S.need).toFixed(1) + 'px)';
    $('scrub-3').style.width = (S.p * 100) + '%';
    $('st-3').textContent = 'Pembatas pita: ' + Math.round(S.p * 100) + '%';
    STATE.ribbon = S.p;
  };
  const complete = () => {
    if (S.done) return;
    S.done = true; S.p = 1; render();
    nb.classList.add('open');
    rib.style.opacity = '.35';
    sfxPaper(); sfxChime();
    typeInto($('nb-hand'), NB_TEXT, 26, () => {});
    showToast('Coretan tangan terbaca 📓');
    finishScene(3);
  };
  onPointer(rib, {
    down: e => { S.sx = e.clientX; S.base = S.p; S.need = roomOf(e.clientX); unlockAudio(); },
    move: e => {
      if (S.sx === null || S.done) return;
      S.p = clamp(S.base + (e.clientX - S.sx) / S.need, 0, 1);
      render();
      if (S.p > 0.2 && S.p < 1 && Math.random() < 0.14) sfxPaper();
      if (S.p >= 1) complete();
    },
    up: () => { S.sx = null; }
  });
  rib.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    unlockAudio();
    if (S.done) return;
    S.need = 120;
    S.p = clamp(S.p + (e.key === 'ArrowRight' ? 0.34 : 0.5), 0, 1);
    render();
    if (S.p >= 1) complete();
  });
}
function typeInto(el, text, speed, done) {
  el.textContent = '';
  let i = 0;
  const step = () => {
    if (i >= text.length) { done && done(); return; }
    const ch = text[i++];
    el.textContent += ch;
    const delay = ',.…'.indexOf(ch) >= 0 ? speed * 7 : speed;
    later(step, delay);
  };
  step();
}

/* ============================================================
   BABAK 4: ELUS KEPALA
   ============================================================ */
function initScene4() {
  const stage = $('chibi-stage'), chibi = $('chibi');
  let last = null, dist = 0, patting = false;
  onPointer(stage, {
    down: e => { last = { x: e.clientX, y: e.clientY }; unlockAudio(); },
    move: e => {
      if (!last || STATE.strokes >= 3) return;
      dist += Math.abs(e.clientY - last.y) + Math.abs(e.clientX - last.x) * 0.5;
      last = { x: e.clientX, y: e.clientY };
      if (dist >= 110) {
        dist = 0;
        STATE.strokes++;
        vibrate(14);
        sfxPop();
        if (!patting) {
          patting = true;
          stage.classList.add('patting');
          chibi.classList.add('pat');
          later(() => {
            stage.classList.remove('patting');
            chibi.classList.remove('pat');
            patting = false;
          }, 900);
        }
        spawnFloaters(3, ['💗', '😍', '✨']);
        $('st-4').textContent = 'Elusan: ' + STATE.strokes + '/3';
        if (STATE.strokes >= 3) {
          stage.classList.add('blush');
          sfxGiggle();
          showToast('Pipiku merah sekali... jangan lihat! 🫣');
          finishScene(4);
        }
      }
    },
    up: () => { last = null; }
  });
}

/* ============================================================
   BABAK 5: ES KRIM (tangkap tetesan)
   ============================================================ */
function syncIceCream() {
  $('st-5').textContent = 'Tertangkap: ' + STATE.caught + '/8 · Meleleh: ' + STATE.melted;
}
function startIceCream() {
  const stage = $('ic-stage');
  stage.querySelectorAll('.drip').forEach(d => d.remove());
  STATE.caught = 0; STATE.melted = 0;
  syncIceCream();
  $('btn-5-next').classList.add('hidden');
  spawnDrip();
  every(spawnDrip, 780);
}
function spawnDrip() {
  const stage = $('ic-stage');
  if (!stage || STATE.currentScene !== 5 || STATE.caught >= 8) return;
  const rect = stage.getBoundingClientRect();
  const d = document.createElement('span');
  d.className = 'drip';
  d.style.left = rand(0.34, 0.66) * rect.width + 'px';
  d.style.top = '76px';
  d.style.setProperty('--fall', (rect.height - 104) + 'px');
  d.style.animationDuration = rand(1.7, 2.5) + 's';
  stage.appendChild(d);

  const miss = () => {
    if (d.classList.contains('caught')) return;
    STATE.melted++;
    d.remove();
    syncIceCream();
  };
  d.addEventListener('animationend', miss);
  d.addEventListener('click', ev => {
    ev.stopPropagation();
    if (d.classList.contains('caught')) return;
    d.classList.add('caught');
    STATE.caught++;
    sfxPop(); vibrate(8);
    syncIceCream();
    setTimeout(() => d.remove(), 300);
    if (STATE.caught >= 8) {
      clearSceneTimers();
      showToast('Es krimnya selamat! 🍦');
      finishScene(5);
    }
  });
}

/* ============================================================
   BABAK 6: SYAL (tarik ke atas)
   ============================================================ */
function initScene6() {
  const scarf = $('scarf'), stage = $('scarf-stage');
  let sy = null, p = 0;
  onPointer(scarf, {
    down: e => { sy = e.clientY; unlockAudio(); },
    move: e => {
      if (sy === null || p >= 1) return;
      const dy = sy - e.clientY;
      p = clamp(dy / 130, 0, 1);
      scarf.style.setProperty('--p', p.toFixed(3));
      $('scrub-6').style.width = (p * 100) + '%';
      $('st-6').textContent = 'Syal: ' + Math.round(p * 100) + '%';
      if (p >= 1) {
        stage.classList.add('covered');
        sfxGiggle(); vibrate(20);
        showToast('Wajahku tersembunyi... tapi pipiku tetap terlihat 🧣');
        finishScene(6);
      }
    },
    up: () => { sy = null; }
  });
}

/* ============================================================
   BABAK 7: LENTERA JALAN
   ============================================================ */
let lampDone = false;
function syncLamp() {
  $('st-7').textContent = 'Lentera: ' + (STATE.lampOn ? 'menyala 🏮' : 'mati') +
    ' · Langkah: ' + STATE.walk + '%';
  $('lamp-street').classList.toggle('lit', STATE.lampOn);
  $('walk-slider').value = STATE.walk;
  $('walkers').style.setProperty('--w', (STATE.walk / 100).toFixed(3));
  $('btn-7-next').classList.toggle('hidden', !(lampDone || (STATE.lampOn && STATE.walk >= 100)));
}
function initScene7() {
  lampDone = false;
  const lamp = $('lamp-post');
  const toggle = () => {
    STATE.lampOn = !STATE.lampOn;
    sfxChime(); vibrate(10);
    showToast(STATE.lampOn ? 'Lentera menyala... jadi hangat, ya?' : 'Lentera dipadamkan');
    syncLamp();
    check();
  };
  lamp.addEventListener('click', toggle);
  lamp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });

  const sl = $('walk-slider');
  sl.addEventListener('input', () => {
    STATE.walk = +sl.value;
    $('walkers').style.setProperty('--w', (STATE.walk / 100).toFixed(3));
    $('walkers').classList.toggle('walking', STATE.walk > 0 && STATE.walk < 100);
    if (STATE.walk > 0 && STATE.walk % 25 === 0) sfxPop();
    syncLamp();
    check();
  });
  function check() {
    if (!lampDone && STATE.lampOn && STATE.walk >= 100) {
      lampDone = true;
      $('walkers').classList.remove('walking');
      syncLamp();
      sfxChime();
      showToast('Kita sampai di ujung jalan... malam ini jangan berakhir 🏮');
      finishScene(7);
    }
  }
}

/* ============================================================
   BABAK 8: GANTUNGAN KUNCI BERUANG (tarik & lepas)
   ============================================================ */
function initScene8() {
  const bear = $('bear'), chain = $('key-chain');
  let sy = null, pull = 0;
  onPointer(bear, {
    down: e => { sy = e.clientY; unlockAudio(); },
    move: e => {
      if (sy === null || STATE.pulls >= 3) return;
      pull = clamp(e.clientY - sy, 0, 92);
      bear.style.setProperty('--pull', pull + 'px');
      chain.style.setProperty('--chain', (46 + pull) + 'px');
    },
    up: () => {
      if (sy === null) return;
      sy = null;
      if (pull >= 40) {
        STATE.pulls++;
        vibrate([14, 30, 14]);
        sfxBell();
        bear.style.setProperty('--pull-end', pull + 'px');
        bear.classList.add('spring');
        setTimeout(() => {
          bear.classList.remove('spring');
          bear.style.setProperty('--pull', '0px');
          chain.style.setProperty('--chain', '46px');
        }, 900);
        $('st-8').textContent = 'Ditarik: ' + STATE.pulls + '/3';
        spawnFloaters(2, ['🔔', '✨']);
        if (STATE.pulls >= 3) {
          showToast('Beruang kecilnya menemani rinduku 🧸');
          finishScene(8);
        }
      }
      pull = 0;
    },
    pointercancel: () => { sy = null; pull = 0; }
  });
}

/* ============================================================
   BABAK 9: PLESTER LUKA (drag & tempel)
   ============================================================ */
function initScene9() {
  const band = $('bandaid'), arm = $('arm'), stage = $('heal-stage');
  let dx = 0, dy = 0;
  makeDrag(band, {
    move: (mx, my) => {
      dx = mx; dy = my;
      band.style.transform = 'translate(' + mx + 'px,' + my + 'px) rotate(' + clamp(mx / 14, -18, 18) + 'deg)';
    },
    up: () => {
      if (STATE.patched) return;
      const b = band.getBoundingClientRect();
      const s = $('scratch').getBoundingClientRect();
      if (overlaps(b, s, 14)) {
        STATE.patched = true;
        const sr = stage.getBoundingClientRect();
        band.style.transform = 'translate(' + (s.left + s.width / 2 - sr.left - 61) + 'px,' +
          (s.top + s.height / 2 - sr.top - 31) + 'px)';
        arm.classList.add('healed');
        sfxChime(); vibrate([16, 40, 16]);
        spawnFloaters(4, ['✨', '💗', '🩹']);
        showToast('Terima kasih sudah merawatku dengan lembut 🩹');
        finishScene(9);
      } else {
        dx = 0; dy = 0;
        band.style.transform = 'translate(0,0)';
        sfxPop();
        $('st-9').textContent = 'Belum kena... tempelkan tepat di goresan';
      }
    }
  });
}

/* ============================================================
   BABAK 10: PESAWAT KERTAS (slingshot)
   ============================================================ */
function initScene10() {
  const plane = $('paper-plane'), stage = $('sky-stage');
  let launched = false;
  makeScrub(plane, {
    need: 260,
    onProgress: p => {
      STATE.charge = p;
      plane.style.setProperty('--px', (-p * 54).toFixed(1) + 'px');
      plane.style.setProperty('--py', (p * 40).toFixed(1) + 'px');
      plane.style.setProperty('--pr', (-6 + p * 22) + 'deg');
      $('scrub-10').style.width = (p * 100) + '%';
      $('st-10').textContent = 'Tenaga tarikan: ' + Math.round(p * 100) + '%';
      if (p > 0 && p < 1 && Math.random() < 0.15) sfxPaper();
    },
    onDone: () => {
      if (launched) return;
      launched = true;
      plane.style.setProperty('--px', '0px');
      plane.style.setProperty('--py', '0px');
      plane.classList.add('flying');
      stage.classList.add('flying');
      sfxWisp(); vibrate(24);
      $('st-10').textContent = 'Pesawat melintasi dua kota... ✈';
      later(() => {
        showToast('Setiap doa malamku mendarat di kotamu 📨');
        finishScene(10);
      }, 1500);
    }
  });
}

/* ============================================================
   BABAK 11: TIKET PERJALANAN
   ============================================================ */
function initScene11() {
  const stamped = [false, false];
  const press = (n) => {
    if (stamped[n - 1]) return;
    if (n === 2 && !stamped[0]) {
      showToast('Tanggalnya dulu, ya... baru jam tibanya 📅');
      return;
    }
    stamped[n - 1] = true;
    STATE.stamps++;
    $('mark-' + n).classList.add('show');
    $('stamp-' + n).disabled = true;
    sfxStamp(); vibrate(22);
    $('st-11').textContent = 'Stempel: ' + STATE.stamps + '/2';
    if (STATE.stamps >= 2) {
      showToast('Tiket menuju kotamu sudah siap 🎫');
      finishScene(11);
    }
  };
  $('stamp-1').addEventListener('click', () => press(1));
  $('stamp-2').addEventListener('click', () => press(2));
}

/* ============================================================
   BABAK 12: PAYUNG BENING
   ============================================================ */
function initScene12() {
  const stage = $('rain-stage'), umb = $('umbrella'), fig = $('fig-me'), pair = document.querySelector('.pair');
  const rain = $('rain');
  for (let i = 0; i < 26; i++) {
    const d = document.createElement('i');
    d.style.left = rand(2, 98) + '%';
    d.style.animationDuration = rand(0.7, 1.3) + 's';
    d.style.animationDelay = rand(0, 1.4) + 's';
    d.style.opacity = rand(0.3, 0.85);
    rain.appendChild(d);
  }
  const openUmb = () => {
    if (STATE.umbOpen) return;
    STATE.umbOpen = true;
    stage.classList.add('open');
    sfxWisp(); vibrate(12);
    $('st-12').textContent = 'Payung terbuka · geser untuk merapat';
    $('umb-hint').textContent = '';
    showToast('Payungnya cukup untuk berdua ☂');
  };
  umb.addEventListener('click', openUmb);
  umb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openUmb(); } });

  let sx = null;
  onPointer(fig, {
    down: e => {
      unlockAudio();
      if (!STATE.umbOpen) { showToast('Buka payungnya dulu, ya ☂'); openUmb(); }
      sx = e.clientX;
    },
    move: e => {
      if (sx === null || STATE.gap <= 4) return;
      const gap = clamp(74 + (e.clientX - sx), 0, 74);
      STATE.gap = gap;
      pair.style.setProperty('--gap', gap + 'px');
      const p = 1 - gap / 74;
      $('scrub-12').style.width = (p * 100) + '%';
      $('st-12').textContent = 'Merapat: ' + Math.round(p * 100) + '%';
      if (gap <= 4) {
        stage.classList.add('together');
        sfxGiggle(); vibrate([16, 40, 16]);
        spawnFloaters(4, ['💗', '☔', '🌸']);
        showToast('Bahumu jadi tempat paling hangat 🌧');
        finishScene(12);
      }
    },
    up: () => { sx = null; }
  });
}

/* ============================================================
   BABAK 13: CANGKIR COKELAT (marshmallow)
   ============================================================ */
function initScene13() {
  const mug = $('mug');
  document.querySelectorAll('.mallow').forEach(m => {
    let dx = 0, dy = 0;
    makeDrag(m, {
      move: (mx, my) => { dx = mx; dy = my; m.style.transform = 'translate(' + mx + 'px,' + my + 'px) scale(1.12)'; },
      up: () => {
        if (m.classList.contains('used')) return;
        const a = m.getBoundingClientRect();
        const b = mug.getBoundingClientRect();
        if (overlaps(a, b, 6)) {
          m.classList.add('used');
          m.style.transform = '';
          STATE.mallows++;
          sfxPop(); vibrate(12);
          mug.style.setProperty('--foam', (0.4 + STATE.mallows * 0.22).toFixed(2));
          $('st-13').textContent = 'Marshmallow: ' + STATE.mallows + '/3';
          spawnFloaters(2, ['☕', '💗']);
          if (STATE.mallows >= 3) {
            mug.classList.add('overflow');
            sfxGiggle();
            showToast('Cokelatnya meluap... hangat sekali ☕');
            finishScene(13);
          }
        } else {
          m.style.transform = '';
          sfxPop();
        }
      }
    });
  });
}

/* ============================================================
   BABAK 14: BUKU SKETSA
   ============================================================ */
function resetSketch() {
  document.querySelectorAll('.sk-sheet').forEach(s => s.classList.remove('flipped'));
  STATE.sheets = 0;
  $('st-14').textContent = 'Lembar terbuka: 0/3';
  $('btn-14-next').classList.add('hidden');
}
function initScene14() {
  $('sketch').addEventListener('click', () => {
    if (STATE.sheets >= 3) return;
    const order = ['s1', 's2', 's3'];
    const el = document.querySelector('.sk-sheet.' + order[STATE.sheets]);
    if (!el) return;
    el.classList.add('flipped');
    STATE.sheets++;
    sfxPaper(); vibrate(10);
    $('st-14').textContent = 'Lembar terbuka: ' + STATE.sheets + '/3';
    if (STATE.sheets >= 3) {
      sfxChime();
      showToast('Semua sketsamu tentangku... terbaca 🎨');
      finishScene(14);
    }
  });
}

/* ============================================================
   BABAK 15: CUBIT PIPI
   ============================================================ */
function initScene15() {
  const stage = $('pinch-stage'), face = $('pinch-face'), target = $('pinch-target');
  let sx = null, p = 0, done = false, need = 170;
  const roomNeeded = x => Math.max(48, Math.min(170, window.innerWidth - x - 16));
  onPointer(target, {
    down: e => {
      sx = e.clientX;
      need = roomNeeded(e.clientX);
      stage.classList.add('pinched');
      unlockAudio();
    },
    move: e => {
      if (sx === null || done) return;
      p = clamp((e.clientX - sx) / need, 0, 1);
      stage.style.setProperty('--pinch', p.toFixed(3));
      $('scrub-15').style.width = (p * 100) + '%';
      $('st-15').textContent = 'Cubitan: ' + Math.round(p * 100) + '%';
      if (p > 0.4 && Math.random() < 0.1) sfxPop();
      if (p >= 1 && !done) {
        done = true;
        face.classList.add('pouted');
        sfxGiggle(); vibrate([20, 50, 20]);
        spawnFloaters(5, ['😝', '💗', '🫣']);
        showToast('Kamu bilang aku lebih menggemaskan saat cemberut?! 😝');
        finishScene(15);
      }
    },
    up: () => { sx = null; }
  });
}

/* ============================================================
   BABAK 16: KOTAK MUSIK (putar tuas 360°)
   ============================================================ */
function initScene16() {
  const crank = $('crank'), arm = $('crank-arm'), box = $('mbox'), notes = $('mbox-notes');
  let prev = null, total = 0, done = false;

  const angleOf = e => {
    const r = crank.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  };
  onPointer(crank, {
    down: e => { prev = angleOf(e); unlockAudio(); },
    move: e => {
      if (prev === null || done) return;
      const a = angleOf(e);
      let d = a - prev;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      prev = a;
      total += Math.abs(d);
      if (Math.random() < 0.3) sfxPop();
      if (Math.random() < 0.22) {
        const n = document.createElement('span');
        n.textContent = ['♪', '♫', '♬'][Math.floor(Math.random() * 3)];
        n.style.left = rand(20, 80) + '%';
        n.style.top = '30%';
        notes.appendChild(n);
        setTimeout(() => n.remove(), 2100);
      }
      const shown = Math.round(total % 360);
      arm.style.setProperty('--deg', (total % 360).toFixed(1) + 'deg');
      crank.setAttribute('aria-valuenow', shown);
      $('st-16').textContent = 'Putaran: ' + Math.min(360, Math.round(total)) + '° / 360°';
      if (total >= 360 && !done) {
        done = true;
        box.classList.add('open');
        sfxMelody(); vibrate([16, 60, 16, 60, 24]);
        later(() => box.classList.add('playing'), 900);
        showToast('Melodinya mengingatkanku padamu 🎼');
        finishScene(16);
      }
    },
    up: () => { prev = null; }
  });
}

/* ============================================================
   BABAK 17: RASI BINTANG (8 titik → hati)
   ============================================================ */
const CONSTEL = [
  { x: 150, y: 236 }, { x: 62, y: 168 }, { x: 44, y: 112 }, { x: 78, y: 60 },
  { x: 150, y: 96 }, { x: 222, y: 60 }, { x: 256, y: 112 }, { x: 238, y: 168 }
];
function resetConstellation() {
  const stars = $('constel-stars'), lines = $('constel-lines');
  stars.innerHTML = ''; lines.innerHTML = '';
  $('constel-svg').classList.remove('done');
  STATE.stars = 0;
  $('st-17').textContent = 'Bintang tersambung: 0/8';
  $('btn-17-next').classList.add('hidden');
  CONSTEL.forEach((p, i) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'constel-star' + (i === 0 ? ' next' : ''));
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    g.dataset.i = i;
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('class', 'halo'); halo.setAttribute('r', 17);
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hit.setAttribute('r', 26); hit.setAttribute('fill', 'transparent');
    const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('class', 'core'); core.setAttribute('r', 8);
    g.appendChild(halo); g.appendChild(core); g.appendChild(hit);
    g.addEventListener('click', () => tapStar(i, g));
    stars.appendChild(g);
  });
}
function tapStar(i, g) {
  if (STATE.stars >= 8) return;
  unlockAudio();
  if (i !== STATE.stars) {
    g.classList.add('shake');
    setTimeout(() => g.classList.remove('shake'), 420);
    sfxPop();
    showToast('Bintangnya berkedip... coba urutan berikutnya ✨');
    return;
  }
  const lines = $('constel-lines');
  if (STATE.stars > 0) {
    const a = CONSTEL[STATE.stars - 1], b = CONSTEL[STATE.stars];
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('class', 'constel-line');
    ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
    ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
    lines.appendChild(ln);
  }
  g.classList.remove('next');
  g.classList.add('on');
  STATE.stars++;
  sfxChime(); vibrate(10);
  $('st-17').textContent = 'Bintang tersambung: ' + STATE.stars + '/8';

  const nxt = document.querySelectorAll('.constel-star')[STATE.stars];
  if (nxt) nxt.classList.add('next');

  if (STATE.stars >= 8) {
    const a = CONSTEL[7], b = CONSTEL[0];
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('class', 'constel-line');
    ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
    ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
    lines.appendChild(ln);
    $('constel-svg').classList.add('done');
    vibrate([20, 60, 30]);
    spawnFloaters(6, ['⭐', '💛', '🌌']);
    showToast('Konstelasi hati menyala keemasan 💫');
    finishScene(17);
  }
}

/* ============================================================
   BABAK 18: KEMBANG API (gesek korek api)
   ============================================================ */
function resetSparkler() {
  $('river-stage').classList.remove('lit');
  $('spk-stars').innerHTML = '';
  STATE.sparks = 0;
  $('scrub-18').style.width = '0%';
  $('st-18').textContent = 'Percikan: 0%';
  $('btn-18-next').classList.add('hidden');
}
function sparkFly(big) {
  const box = $('spk-stars');
  const n = big ? 16 : 5;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const ang = rand(0, Math.PI * 2), dist = rand(20, big ? 90 : 56);
    s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
    s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
    s.style.setProperty('--dur', rand(0.5, 1.2) + 's');
    box.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}
function initScene18() {
  const pad = $('strike-pad'), match = $('match');
  makeScrub(pad, {
    need: 520,
    onProgress: p => {
      STATE.sparks = p;
      $('scrub-18').style.width = (p * 100) + '%';
      $('st-18').textContent = 'Percikan: ' + Math.round(p * 100) + '%';
      match.style.setProperty('--mx', (Math.sin(p * 40) * 34).toFixed(1) + 'px');
      if (Math.random() < 0.3) { sfxSpark(); sparkFly(false); }
    },
    onDone: () => {
      $('river-stage').classList.add('lit');
      sfxSpark(); sfxChime(); vibrate([18, 50, 18]);
      sparkFly(true);
      every(() => { if (STATE.currentScene === 18) sparkFly(false); }, 420);
      showToast('Kembang api menyala... masa depan kita ikut bersinar 🎇');
      finishScene(18);
    }
  });
}

/* ============================================================
   BABAK 19: SENSOR DETAK JANTUNG (tahan 3 detik)
   ============================================================ */
let heartTimer = null;
function resetHeart() {
  $('hb-stage').classList.remove('holding', 'done');
  $('hb-fill').style.strokeDashoffset = 377;
  $('st-19').textContent = 'Progres: 0%';
  $('btn-19-next').classList.add('hidden');
  STATE.hold = 0;
  clearInterval(heartTimer);
}
function initScene19() {
  const stage = $('hb-stage'), pad = $('hb-pad');
  makeHold(pad, 3000, {
    onStart: () => {
      stage.classList.add('holding');
      let beat = 640;
      sfxHeart(0.24);
      heartTimer = setInterval(() => {
        beat = Math.max(280, beat - 60);
        sfxHeart(beat / 1000);
        vibrate(12);
      }, beat);
    },
    onProgress: p => {
      STATE.hold = p;
      $('hb-fill').style.strokeDashoffset = (377 * (1 - p)).toFixed(1);
      $('st-19').textContent = 'Progres: ' + Math.round(p * 100) + '%';
    },
    onDone: () => {
      clearInterval(heartTimer);
      stage.classList.remove('holding');
      stage.classList.add('done');
      sfxHeart(0.18);
      vibrate([30, 50, 30, 50, 60]);
      spawnFloaters(6, ['💗', '🫀', '💗']);
      showToast('Detak ini hanya untukmu... dari dulu sampai sekarang 💗');
      finishScene(19);
    },
    onCancel: () => {
      clearInterval(heartTimer);
      stage.classList.remove('holding');
      $('hb-fill').style.strokeDashoffset = 377;
      $('st-19').textContent = 'Progres: 0% (jangan dilepas!)';
    }
  });
}

/* ============================================================
   BABAK 20: TOPLES PENUH BINTANG
   ============================================================ */
function initScene20() {
  const fill = $('star-fill');
  if (!fill.children.length) {
    for (let i = 0; i < 64; i++) {
      const s = document.createElement('i');
      s.style.setProperty('--i', i);
      fill.appendChild(s);
    }
  }
  const unlock = () => {
    if (STATE.unlocked) return;
    STATE.unlocked = true;
    const lock = $('padlock');
    lock.classList.add('open');
    sfxUnlock(); vibrate(24);

    later(() => {
      $('jar2').classList.add('open');
      sfxChime(); sfxWisp();
      const jar = $('jar2').getBoundingClientRect();
      for (let i = 0; i < 64; i++) {
        const st = document.createElement('span');
        st.className = 'burst-star';
        st.style.left = (jar.left + jar.width / 2 - 11) + 'px';
        st.style.top = (jar.top + jar.height / 2 - 11) + 'px';
        st.style.setProperty('--dx', rand(-260, 260).toFixed(0) + 'px');
        st.style.setProperty('--dy', rand(-340, 240).toFixed(0) + 'px');
        st.style.setProperty('--dr', rand(-540, 540).toFixed(0) + 'deg');
        st.style.setProperty('--dur', rand(1.8, 3.4) + 's');
        st.style.animationDelay = (rand(0, 0.5)) + 's';
        document.body.appendChild(st);
        setTimeout(() => st.remove(), 4200);
      }
      fill.innerHTML = '';
      $('st-20').textContent = 'Ratusan bintang berhamburan 🌠';
      showToast('Rahasianya akhirnya kamu tahu... dan hatimu menyambutku 💛');
      finishScene(20);
    }, 620);
  };
  $('padlock').addEventListener('click', unlock);
  $('padlock').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unlock(); } });
}

/* ============================================================
   BABAK 21: SURAT SEGEL LILIN
   ============================================================ */
const LETTER = 'Ada begitu banyak malam yang aku habiskan untuk menatap langit, menyimpan satu pertanyaan yang tak pernah berani kuucapkan: apakah kamu juga sesekali memikirkanku?\n\nRahasia ini sudah bertahun-tahun aku lipat, satu bintang demi satu bintang, sampai toples itu penuh dan tak lagi muat ditutup rapat-rapat. Aku menyimpannya diam-diam — di halaman buku, di balik syal, di setiap pesawat kertas yang kutembangkan ke arah kotamu.\n\nAku tidak menjanjikan langit tanpa hujan, atau jalan tanpa jarak. Aku hanya menjanjikan satu hal: setiap kali kamu menoleh ke belakang, aku akan selalu ada di sana, masih membawa toples yang sama, masih melipat doa yang sama, masih mencintaimu dengan cara yang sama.\n\nTerima kasih sudah membuka segel ini. Sekarang giliranmu menyimpan rahasia kita... selamanya.';
let letterTimers = [];
function clearLetter() { letterTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); letterTimers = []; }
function resetLetter() {
  clearLetter();
  STATE.letterDone = false;
  $('envelope').classList.remove('open');
  $('wax').classList.remove('broken');
  $('letter-sheet').classList.remove('up');
  $('env-stage').classList.remove('reading');
  $('letter-text').textContent = '';
  $('letter-sign').textContent = '';
  $('btn-skip').classList.add('hidden');
  $('st-21').textContent = 'Surat masih tersegel';
  $('btn-21-next').classList.add('hidden');
  letterFollow = true;
  letterTo(0);
}
let letterFollow = true, letterProgScroll = false;
function letterSheet() { return $('letter-sheet'); }
function letterTo(top) {
  const sh = letterSheet();
  letterProgScroll = true;
  sh.scrollTop = top;
}
function typeLetter(full, done) {
  clearLetter();
  const el = $('letter-text');
  el.textContent = '';
  letterFollow = true;
  let i = 0;
  const step = () => {
    if (i >= full.length) { done && done(); return; }
    const ch = full[i++];
    el.textContent += ch;
    const sh = letterSheet();
    if (letterFollow && sh.scrollHeight - sh.clientHeight > 2) letterTo(sh.scrollHeight);
    const delay = '\n'.indexOf(ch) >= 0 ? 260 : ',.…”'.indexOf(ch) >= 0 ? 150 : 17;
    letterTimers.push(setTimeout(step, delay));
  };
  step();
}
function skipLetter() {
  clearLetter();
  $('letter-text').textContent = LETTER;
  $('letter-sign').textContent = '— Aku, yang akhirnya berani, 💗';
  $('btn-skip').classList.add('hidden');
  letterFollow = false;
  letterTo(0);
  finishLetter();
}
function finishLetter() {
  STATE.letterDone = true;
  $('st-21').textContent = 'Surat terbaca sampai tuntas 💌';
  sfxChime(); vibrate([20, 60, 30]);
  spawnFloaters(6, ['💌', '💗', '🌸']);
  finishScene(21);
}
function initScene21() {
  $('letter-sheet').addEventListener('scroll', () => {
    const sh = $('letter-sheet');
    if (letterProgScroll) { letterProgScroll = false; return; }
    if (sh.scrollTop + sh.clientHeight < sh.scrollHeight - 8) letterFollow = false;
  });
  $('wax').addEventListener('click', () => {
    if (STATE.letterDone || $('wax').classList.contains('broken')) return;
    unlockAudio();
    $('wax').classList.add('broken');
    sfxPaper(); vibrate(20);
    $('st-21').textContent = 'Segel pecah... surat terbentang';
    later(() => {
      $('envelope').classList.add('open');
      sfxChime();
      later(() => {
        $('letter-sheet').classList.add('up');
        $('env-stage').classList.add('reading');
        $('btn-skip').classList.remove('hidden');
        sfxPaper();
        typeLetter(LETTER, () => {
          $('letter-sign').textContent = '— Aku, yang akhirnya berani, 💗';
          $('btn-skip').classList.add('hidden');
          later(finishLetter, 500);
        });
      }, 500);
    }, 500);
  });
  $('wax').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('wax').click(); } });
  $('btn-skip').addEventListener('click', skipLetter);
}

/* ============================================================
   BABAK 22: GRAND FINALE
   ============================================================ */
let finaleOn = false;
function enterFinale() {
  finaleOn = true;
  const rain = $('petal-rain');
  if (!rain.children.length) {
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('i');
      p.style.setProperty('--x', rand(0, 100) + '%');
      p.style.setProperty('--dur', rand(5, 11) + 's');
      p.style.setProperty('--del', rand(0, 8) + 's');
      p.style.setProperty('--sway', rand(-90, 90) + 'px');
      p.style.transform = 'scale(' + rand(0.7, 1.5).toFixed(2) + ')';
      rain.appendChild(p);
    }
  }
  const msg = 'Rahasia hatiku akhirnya sampai padamu 🌸 Toples bintangku penuh, suratnya kubuka, dan jawabanku selalu sama: iya, aku juga. 💗';
  $('btn-wa').href = 'https://wa.me/6281249192305?text=' + encodeURIComponent(msg);
  if (!STATE.musicMuted && STATE.audioUnlocked) { /* musik tetap mengalir */ }
  sfxChime();
  showToast('Kita sampai di akhir cerita... 🌸');
}
function exitFinale() { finaleOn = false; }

/* ============================================================
   AMBIENT CANVAS (bintang & bintang jatuh)
   ============================================================ */
function initAmbient() {
  const cv = $('ambient-canvas');
  const ctx = cv.getContext('2d');
  let w, h, stars = [], shoot = null;
  const resize = () => {
    w = cv.width = window.innerWidth * devicePixelRatio;
    h = cv.height = window.innerHeight * devicePixelRatio;
    stars = Array.from({ length: 70 }, () => ({
      x: rand(0, w), y: rand(0, h), r: rand(0.4, 1.6) * devicePixelRatio,
      a: rand(0.2, 0.9), s: rand(0.002, 0.01)
    }));
  };
  resize();
  window.addEventListener('resize', resize);
  let t = 0;
  const loop = () => {
    t++;
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.s * 6));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,226,154,' + alpha.toFixed(3) + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!shoot && Math.random() < 0.0035) {
      shoot = { x: rand(w * 0.2, w * 0.9), y: rand(0, h * 0.4), life: 0 };
    }
    if (shoot) {
      shoot.life++;
      const p = shoot.life / 60;
      const x = shoot.x - p * 260 * devicePixelRatio;
      const y = shoot.y + p * 130 * devicePixelRatio;
      const g = ctx.createLinearGradient(x, y, x + 70 * devicePixelRatio, y - 34 * devicePixelRatio);
      g.addColorStop(0, 'rgba(255,246,238,' + (1 - p) + ')');
      g.addColorStop(1, 'rgba(255,154,162,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70 * devicePixelRatio, y - 34 * devicePixelRatio); ctx.stroke();
      if (p >= 1) shoot = null;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

/* ============================================================
   FINALE CANVAS (kelopak & kilau jatuh)
   ============================================================ */
function initFinaleCanvas() {
  const cv = $('finale-canvas');
  const ctx = cv.getContext('2d');
  let w, h, parts = [];
  const resize = () => {
    w = cv.width = window.innerWidth * devicePixelRatio;
    h = cv.height = window.innerHeight * devicePixelRatio;
  };
  resize();
  window.addEventListener('resize', resize);
  const make = () => ({
    x: rand(0, w), y: -20, vy: rand(1, 3.4) * devicePixelRatio,
    vx: rand(-0.7, 0.7) * devicePixelRatio, r: rand(4, 10) * devicePixelRatio,
    rot: rand(0, 6.28), vr: rand(-0.05, 0.05),
    kind: Math.random() < 0.45 ? 'star' : 'petal',
    c: Math.random() < 0.5 ? '#ff9aa2' : '#ffd166'
  });
  const loop = () => {
    ctx.clearRect(0, 0, w, h);
    if (finaleOn) {
      if (parts.length < 70) parts.push(make());
      parts.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.85;
        if (p.kind === 'star') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * p.r, Math.sin(a) * p.r);
          }
          ctx.closePath(); ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      parts = parts.filter(p => p.y < h + 30);
    } else if (parts.length) parts = [];
    requestAnimationFrame(loop);
  };
  loop();
}

/* ============================================================
   MUSIK UI
   ============================================================ */
function initMusicUI() {
  $('music-pill').addEventListener('click', () => { unlockAudio(); toggleMusic(); });
  const fmVol = $('fm-vol');
  fmVol.addEventListener('input', () => {
    ensureAudio();
    if (A.master) A.master.gain.value = fmVol.value / 100;
  });
  $('fm-play').addEventListener('click', () => { unlockAudio(); toggleMusic(); });
  $('fm-prev').addEventListener('click', () => switchTrack(-1));
  $('fm-next').addEventListener('click', () => switchTrack(1));
}

/* ============================================================
   JEDA SESI & RESTART
   ============================================================ */
function initSessionBreak() {
  $('btn-start-s2').addEventListener('click', () => {
    $('session-break').classList.add('hidden');
    sfxChime();
    vibrate([20, 50, 20]);
    showScene(12);
  });
}
function restartJourney() {
  try { localStorage.removeItem(SCENE_KEY); } catch (e) {}
  location.reload();
}
window.restartJourney = restartJourney;

/* ============================================================
   INIT
   ============================================================ */
function initSceneButtons() {
  for (let i = 1; i <= 21; i++) {
    const b = $('btn-' + i + '-next');
    if (b) b.addEventListener('click', nextScene);
  }
}

let booted = false;
function main() {
  if (booted) return;
  booted = true;
  initMusicUI();
  initSessionBreak();
  initSceneButtons();

  initScene1(); initScene2(); initScene3(); initScene4();
  initScene6(); initScene7(); initScene8(); initScene9(); initScene10();
  initScene11(); initScene12(); initScene13(); initScene14(); initScene15();
  initScene16(); initScene18(); initScene19(); initScene20();
  initScene21();

  initAmbient();
  initFinaleCanvas();

  /* posisi awal (dari penyimpanan) */
  let start = 1;
  try {
    const saved = parseInt(localStorage.getItem(SCENE_KEY) || '1', 10);
    if (saved >= 1 && saved <= TOTAL_SCENES) start = saved;
  } catch (e) {}
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  STATE.currentScene = start;
  $('scene-' + start).classList.add('active');
  onSceneEnter(start);

  document.addEventListener('pointerdown', unlockAudio, { once: false });
  updateMusicUI(false);
  if (start > 1) showToast('Selamat datang kembali... lanjut dari yang terakhir 🌸');
}

document.addEventListener('DOMContentLoaded', main);
