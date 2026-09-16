import type { HabitData, BiometricData } from "./types";

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function rnd(min: number, max: number, decimals = 0) {
  const v = min + Math.random() * (max - min);
  return decimals ? parseFloat(v.toFixed(decimals)) : Math.round(v);
}

function sine(i: number, period: number, amplitude: number, offset: number) {
  return Math.sin((i / period) * 2 * Math.PI) * amplitude + offset;
}

function gen(days: number, fn: (i: number) => number, note?: (i: number) => string) {
  return Array.from({ length: days }, (_, i) => {
    const value = fn(i);
    const n = note ? note(i) : undefined;
    return { date: dateString(days - 1 - i), value, ...(n ? { note: n } : {}) };
  });
}

const DAYS = 365;

// ── Habit data ────────────────────────────────────────────────────────────

function moodVal(i: number) {
  const base = 3 + sine(i, 365, 1.2, 0);
  return Math.max(1, Math.min(5, Math.round(base + (Math.random() - 0.5))));
}

function foodNote(i: number): string {
  const weekend = (i % 7) < 2;
  const b = rnd(300, 550);
  const l = weekend ? rnd(400, 700) : rnd(500, 800);
  const d = weekend ? rnd(400, 650) : rnd(550, 850);
  const s = rnd(100, 300);
  return JSON.stringify({ breakfast: b, lunch: l, dinner: d, snacks: s });
}

export const defaultData: HabitData = {
  water:      gen(DAYS, (i) => (i % 14 === 0) ? rnd(3, 5) : rnd(6, 9)),
  medication: gen(DAYS, () => Math.random() > 0.15 ? 1 : 0),
  food:       gen(DAYS, (i) => { const w = (i%7)<2; return w ? rnd(1400,2000) : rnd(1700,2400); }, foodNote),
  exercise:   gen(DAYS, (i) => i%7===0 ? 0 : i%7===3 ? rnd(0,15) : rnd(20,75)),
  sleep:      gen(DAYS, (i) => { const mid = i%7===2||i%7===3; return mid ? rnd(1, 3) : rnd(3, 5); }),
  mood:       gen(DAYS, moodVal),
  custom: [
    {
      id: "reading", name: "Reading", unit: "pages", target: 20,
      color: "#374151", icon: "📚",
      entries: gen(DAYS, () => Math.random() > 0.3 ? rnd(5, 40) : 0),
    },
  ],
};

// ── Biometric data ────────────────────────────────────────────────────────

// Resting HR: 58–72 bpm, slightly elevated mid-week stress
function hrVal(i: number) {
  const stress = (i % 7 === 2 || i % 7 === 3) ? 4 : 0;
  return Math.round(sine(i, 30, 3, 64) + stress + (Math.random() - 0.5) * 4);
}

// HRV: inversely correlated with HR & stress, seasonal variation
function hrvVal(i: number) {
  const base = 52 - sine(i, 30, 8, 0);
  const stress = (i % 7 === 2 || i % 7 === 3) ? -6 : 0;
  return Math.max(20, Math.round(base + stress + (Math.random() - 0.5) * 6));
}

// SpO2: 96–99%, occasional 95 dips
function spo2Val() {
  return Math.random() > 0.05 ? rnd(97, 99) : 95;
}

// Recovery score: correlates with HRV and sleep
function recoveryVal(i: number) {
  const hrv = hrvVal(i);
  const base = Math.round((hrv / 65) * 100);
  return Math.max(30, Math.min(99, base + rnd(-10, 10)));
}

// Stress score: inverse of recovery, higher mid-week
function stressVal(i: number) {
  const base = 100 - recoveryVal(i);
  const midweek = (i % 7 === 2 || i % 7 === 3) ? 15 : 0;
  return Math.max(10, Math.min(90, base + midweek + rnd(-8, 8)));
}

// Steps: weekends lower, weekdays higher
function stepsVal(i: number) {
  const weekend = (i % 7) < 2;
  return weekend ? rnd(4000, 8000) : rnd(6500, 14000);
}

// Active calories: tracks with steps + exercise
function activeCalVal(i: number) {
  const base = Math.round(stepsVal(i) * 0.04);
  return base + rnd(50, 150);
}

// VO2 Max: very slow drift, mostly stable
function vo2Val(i: number) {
  return parseFloat((42 + sine(i, 365, 2, 0) + (Math.random() - 0.5) * 0.4).toFixed(1));
}

// Sleep stages — correlated with total sleep from habit data
function sleepStages(i: number): { rem: number; deep: number; core: number } {
  const total = defaultData.sleep[i]?.value ?? 7;
  const rem  = parseFloat((total * rnd(18, 25) / 100).toFixed(1));
  const deep = parseFloat((total * rnd(15, 22) / 100).toFixed(1));
  const core = parseFloat((total - rem - deep).toFixed(1));
  return { rem, deep, core };
}

export const defaultBiometrics: BiometricData = {
  heartRate:       gen(DAYS, hrVal),
  hrv:             gen(DAYS, hrvVal),
  spo2:            gen(DAYS, spo2Val),
  respiratoryRate: gen(DAYS, () => rnd(13, 18)),
  bodyTemp:        gen(DAYS, () => rnd(-5, 5, 1) / 10),
  steps:           gen(DAYS, stepsVal),
  activeCalories:  gen(DAYS, activeCalVal),
  vo2max:          gen(DAYS, vo2Val),
  standHours:      gen(DAYS, (i) => (i%7)<2 ? rnd(6, 10) : rnd(9, 14)),
  sleepRem:        gen(DAYS, (i) => sleepStages(i).rem),
  sleepDeep:       gen(DAYS, (i) => sleepStages(i).deep),
  sleepCore:       gen(DAYS, (i) => sleepStages(i).core),
  recoveryScore:   gen(DAYS, recoveryVal),
  stressScore:     gen(DAYS, stressVal),
  weight:          gen(DAYS, (i) => parseFloat((72 + sine(i, 30, 0.8, 0) + (Math.random()-0.5)*0.3).toFixed(1))),
};
