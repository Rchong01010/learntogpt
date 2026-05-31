#!/usr/bin/env node
/**
 * Shuffles multiple-choice answer options in seed JSON files
 * using a deterministic seeded PRNG so results are reproducible.
 *
 * Usage: node scripts/shuffle-answers.js
 */

const fs = require("fs");
const path = require("path");

// Simple seeded PRNG (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit integer for seeding
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
}

// Fisher-Yates shuffle with seeded random
function seededShuffle(arr, rng) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const SEED_DIR = path.join(__dirname, "..", "content", "seed");
const FILES = [
  "track1-fundamentals.json",
  "track2-work.json",
  "track3-claude-code.json",
  "track4-api-agents.json",
  "track5-architect-prep.json",
];

const beforeDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
const afterDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
let totalExercises = 0;

for (const file of FILES) {
  const filePath = path.join(SEED_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  for (const course of data.courses) {
    for (const lesson of course.lessons) {
      if (!lesson.exercises) continue;

      for (let idx = 0; idx < lesson.exercises.length; idx++) {
        const ex = lesson.exercises[idx];

        // Only process exercises with options and a numeric correct_answer
        if (!ex.options || typeof ex.correct_answer !== "number") continue;

        totalExercises++;
        const correctIdx = ex.correct_answer;
        beforeDist[correctIdx] = (beforeDist[correctIdx] || 0) + 1;

        // Remember the correct option text
        const correctOption = ex.options[correctIdx];

        // Seed from exercise id (or fallback to file+index)
        const seedStr = ex.id || `${file}:${idx}`;
        const rng = mulberry32(hashString(seedStr));

        // Shuffle options
        const shuffled = seededShuffle(ex.options, rng);

        // Find new index of correct option
        const newIdx = shuffled.indexOf(correctOption);

        ex.options = shuffled;
        ex.correct_answer = newIdx;

        afterDist[newIdx] = (afterDist[newIdx] || 0) + 1;
      }
    }
  }

  // Write back pretty-printed with 2-space indent
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated: ${file}`);
}

console.log(`\nTotal exercises shuffled: ${totalExercises}`);
console.log("\n--- BEFORE distribution ---");
for (const [k, v] of Object.entries(beforeDist)) {
  const pct = totalExercises ? ((v / totalExercises) * 100).toFixed(1) : "0.0";
  console.log(`  Answer ${k}: ${v} (${pct}%)`);
}
console.log("\n--- AFTER distribution ---");
for (const [k, v] of Object.entries(afterDist)) {
  const pct = totalExercises ? ((v / totalExercises) * 100).toFixed(1) : "0.0";
  console.log(`  Answer ${k}: ${v} (${pct}%)`);
}
