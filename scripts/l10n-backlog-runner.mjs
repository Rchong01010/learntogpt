/**
 * LearnToGPT localization backlog runner — ONE sequential script, no agent fan-out.
 * (rule: feedback_bulk_db_transform_use_script_not_agents)
 *
 * WHAT IT DOES (platform='learntogpt' ONLY — never touches claude-academy rows,
 * never touches en rows, never deletes anything):
 *   Phase A: for every locale in LOCALES, inserts missing course locale rows and
 *            missing lesson locale rows (with their exercises), translated from
 *            the en twins that live in the DB (DB is the canonical en source —
 *            the repo seed files are stale).
 *            Also repairs lessons that exist but have FEWER exercises than the
 *            en twin (crash-resume safety: re-running is idempotent).
 *   Phase B: fixes the CA-known pipeline debt on EXISTING localized rows —
 *            text-bearing exercises whose GRADING TOKENS are still English get
 *            their displayed strings + grading tokens (re)translated. Detection
 *            is token-level, NOT whole-blob: a row counts as stranded if any
 *            keyword_group element (prompt_lab/speed_prompt/scenario_walkthrough)
 *            OR matching_pairs key/value OR any other text-bearing sub-field is
 *            byte-identical to its en twin AND is not a protected brand term.
 *            This catches the ~235 PARTIALLY-translated rows (05-31/06-15) whose
 *            scenario/labels were translated but whose keyword_group grading
 *            tokens stayed English — a target-language learner typing the right
 *            answer scored 0. The old gate (`correct_answer == en`) missed these
 *            because the display text differed from en, so the blob differed.
 *            Index/number answers (multiple_choice/scenario/drag_drop/true_false)
 *            are NOT text types -> Phase B never touches them (indices preserved
 *            verbatim by construction).
 *
 * GRADING SEMANTICS — PINNED UP FRONT (pattern proven in claude-academy
 * scripts/translate-correct-answers.mjs; grading for game types is 100%
 * client-side off the same strings, so translating displayed text is
 * self-consistent):
 *   - multiple_choice / scenario / drag_drop : correct_answer is a numeric
 *     index/code -> COPIED VERBATIM, never sent to the model.
 *   - fill_blank      : answer words remapped deterministically via the
 *     en-option -> translated-option index map. NO model involved.
 *   - matching_pairs  : keys AND values are displayed + graded strings ->
 *     both translated, pairing preserved, collision-guarded.
 *   - prompt_lab / speed_prompt / scenario_walkthrough : scenario, tips,
 *     labels, options, feedback, AND keyword_group translated (client
 *     substring-matches the learner's TYPED target-language answer against
 *     keyword_group -> English keywords would score localized learners 0).
 *     `correct` indices, points, thresholds, structure preserved and verified
 *     by a structural signature guard.
 *   - prompt_builder  : pieces/context translated; correct_order preserved.
 *   - flash_cards     : front/back translated (display only).
 *   Any other/unknown text-bearing type -> left verbatim + flagged loose end.
 *
 * Resumable: everything is derived from DB state each run (missing pair /
 * exercise-count / identical-to-en identity checks), so re-running after a
 * crash just continues. Progress JSON: logs/l10n_backlog_progress.json.
 *
 * Usage: node scripts/l10n-backlog-runner.mjs [--dry-run]
 * Env:   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from LG .env.local;
 *        GEMINI_API_KEY from LG .env.local, else read from CA .env.local (read-only).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const PLATFORM = "learntogpt";
const LOCALES = ["pt-BR", "ja", "ko", "zh-CN", "de", "fr", "es"]; // pt-BR first per Reid
const PROGRESS_PATH = path.join(ROOT, "logs", "l10n_backlog_progress.json");

// ---------- env (no dotenv dep) ----------
function parseEnvFile(p) {
  const out = {};
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const lgEnv = parseEnvFile(path.join(ROOT, ".env.local"));
const caEnv = parseEnvFile("/home/ludo/claude-academy/.env.local");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || lgEnv.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || lgEnv.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY || lgEnv.GEMINI_API_KEY || caEnv.GEMINI_API_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("FATAL: missing Supabase env"); process.exit(1); }
if (!GEMINI_KEY) { console.error("FATAL: missing GEMINI_API_KEY"); process.exit(1); }
const H = { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY };

const ts = () => new Date().toISOString();
const log = (...a) => console.log(ts(), ...a);
const logErr = (...a) => console.error(ts(), "ERROR", ...a);

// ---------- Gemini via REST (zero-dep) ----------
const LOCALE_LABELS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese (zh-CN)",
  de: "German", fr: "French", es: "Spanish", "pt-BR": "Brazilian Portuguese (pt-BR)",
};
const BATCH = 40;
const SYSTEM = `You are a professional software-localization translator for LearnToGPT, a gamified course platform teaching people to use ChatGPT.

You will receive a JSON array of UI/course strings. Translate EACH element into the target language and return ONLY a JSON array of the SAME LENGTH in the SAME ORDER. No commentary, no markdown fences.

RULES:
- Preserve every HTML/XML tag exactly (<p>, <strong>, <em>, <code>, <ul>, <li>, <h2>, <h3>, <pre> ...). Translate only the human-readable text between tags.
- Preserve code inside <code>/<pre> literally.
- Preserve URLs, href targets, and placeholders like {variable} / {{variable}}.
- Never translate these brand/product/feature names (keep them in Latin script exactly): ChatGPT, GPT, GPTs, Custom GPT, OpenAI, LearnToGPT, DALL-E, Sora, Zapier, Make, Canva, Slack, Notion, Stripe, HubSpot, Python, API.
- Preserve exact price/number tokens like "$19.99", "$200/hour", "12/year".
- Some strings are SEARCH KEYWORDS a learner's typed answer is matched against: translate them as the natural short word/phrase a native speaker would actually type for that concept.
- Keep the tone encouraging, clear, slightly playful — matching the source register.
- Do NOT add, drop, merge, split, or reorder array elements. Output array length MUST equal input array length.`;

async function withRetry(fn, label, maxAttempts = 4) {
  let lastErr;
  for (let a = 1; a <= maxAttempts; a++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      logErr("retry", label, "attempt", a, "->", err.message);
      await new Promise((r) => setTimeout(r, 2000 * a * a));
    }
  }
  throw lastErr;
}

let geminiCalls = 0;
async function translateBatchRaw(strings, localeLabel, label) {
  return withRetry(async () => {
    geminiCalls++;
    const body = {
      contents: [{ role: "user", parts: [{ text: `${SYSTEM}\n\nTarget language: ${localeLabel}\n\nInput JSON array (${strings.length} strings):\n${JSON.stringify(strings)}` }] }],
      generationConfig: { maxOutputTokens: 65536, temperature: 0.3, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
    };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    let text = (j.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    if (text.startsWith("```")) text = text.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
    const out = JSON.parse(text);
    if (!Array.isArray(out)) throw new Error("model did not return an array");
    if (out.length !== strings.length) throw new Error(`length mismatch ${out.length}!=${strings.length}`);
    if (out.some((s) => typeof s !== "string")) throw new Error("non-string element");
    return out;
  }, label);
}
async function translateAll(strings, localeLabel, label) {
  const out = new Array(strings.length);
  for (let s = 0; s < strings.length; s += BATCH) {
    const slice = strings.slice(s, s + BATCH);
    const res = await translateBatchRaw(slice, localeLabel, `${label}[${s}..${s + slice.length}]`);
    for (let i = 0; i < slice.length; i++) out[s + i] = res[i];
    await new Promise((r) => setTimeout(r, 250));
  }
  return out;
}

// ---------- Supabase REST helpers ----------
async function sbGet(pathq) {
  let out = [], from = 0; const step = 1000;
  for (;;) {
    const r = await withRetry(async () => {
      const rr = await fetch(`${SUPABASE_URL}/rest/v1/${pathq}`, { headers: { ...H, Range: `${from}-${from + step - 1}` } });
      if (!rr.ok) throw new Error(`GET ${pathq}: ${rr.status} ${(await rr.text()).slice(0, 200)}`);
      return rr.json();
    }, `GET ${pathq.slice(0, 60)}`);
    out = out.concat(r);
    if (r.length < step) break;
    from += step;
  }
  return out;
}
async function sbGetChunkedIn(table, sel, col, ids, extra = "") {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    out.push(...(await sbGet(`${table}?select=${sel}&${col}=in.(${chunk.join(",")})${extra}`)));
  }
  return out;
}
async function sbInsert(table, row) {
  return withRetry(async () => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error(`POST ${table}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    return (await r.json())[0];
  }, `POST ${table}`);
}
async function sbPatch(table, filter, patch) {
  return withRetry(async () => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error(`PATCH ${table}?${filter}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  }, `PATCH ${table}`);
}

// ---------- correct_answer collectors (from CA translate-correct-answers.mjs) ----------
const TEXT_TYPES = ["matching_pairs", "scenario_walkthrough", "prompt_lab", "speed_prompt", "fill_blank", "prompt_builder", "flash_cards"];
const PRESERVE_TYPES = ["multiple_choice", "scenario", "drag_drop", "true_false"];

// Brand/product/feature terms kept in Latin script across all locales (mirror of the
// SYSTEM keep-list). A translated token that equals its en twin BUT is a brand term is
// NOT evidence of a stranded row — so we exclude these from stranded-detection.
const BRAND_KEEP = new Set([
  "chatgpt", "gpt", "gpts", "custom gpt", "openai", "learntogpt", "dall-e", "sora",
  "zapier", "make", "canva", "slack", "notion", "stripe", "hubspot", "python", "api",
].map((s) => s.toLowerCase()));
const isBrand = (s) => typeof s === "string" && BRAND_KEEP.has(s.trim().toLowerCase());

// Detect whether an EXISTING localized text-bearing exercise still has GRADING TOKENS
// (or any collected displayed string) byte-identical to its en twin — i.e. the grading
// side was never translated even if display text was. Uses the SAME collectors that do
// the repair, so detection and repair are consistent by construction. Returns true if
// at least one collected string is byte-identical to the en twin's aligned string AND
// contains a Latin letter AND is not a protected brand term.
function isStranded(enEx, locEx) {
  if (!TEXT_TYPES.includes(enEx.type)) return false;
  if (enEx.type === "fill_blank") {
    // fill_blank grading is an index-remap off options; stranded iff the answer blob is
    // byte-identical to en (options translated but answers left as en words).
    return (locEx.correct_answer || "") === (enEx.correct_answer || "");
  }
  let enCol, locCol;
  try {
    enCol = collectorFor(enEx.type, enEx.correct_answer || "");
    locCol = collectorFor(locEx.type, locEx.correct_answer || "");
  } catch { return false; }
  if (enCol.strings.length !== locCol.strings.length) return false; // shape differs — Phase A territory
  for (let i = 0; i < enCol.strings.length; i++) {
    const a = enCol.strings[i], b = locCol.strings[i];
    if (a === b && /[A-Za-z]/.test(a) && !isBrand(a)) return true;
  }
  return false;
}

function collectorFor(type, ca) {
  const obj = JSON.parse(ca);
  const strings = [], setters = [];
  const push = (v, set) => { if (typeof v === "string" && v.trim() !== "") { strings.push(v); setters.push(set); } };

  if (type === "matching_pairs") {
    const entries = Object.entries(obj);
    const keyState = entries.map(([k]) => ({ k }));
    entries.forEach(([k, v], i) => {
      push(k, (t) => { keyState[i].k = t; });
      push(v, (t) => { keyState[i].v = t; });
      keyState[i].v = v;
    });
    return { strings, rebuild: (tr) => { setters.forEach((s, i) => s(tr[i])); const o = {}; for (const p of keyState) o[p.k] = p.v; return JSON.stringify(o); } };
  }
  if (type === "flash_cards") {
    const cards = obj.map((c) => ({ ...c }));
    cards.forEach((c, i) => { push(c.front, (t) => { cards[i].front = t; }); push(c.back, (t) => { cards[i].back = t; }); });
    return { strings, rebuild: (tr) => { setters.forEach((s, i) => s(tr[i])); return JSON.stringify(cards); } };
  }
  if (type === "prompt_builder") {
    const o = { ...obj, pieces: [...(obj.pieces || [])] };
    (o.pieces || []).forEach((p, i) => push(p, (t) => { o.pieces[i] = t; }));
    push(o.context, (t) => { o.context = t; });
    return { strings, rebuild: (tr) => { setters.forEach((s, i) => s(tr[i])); return JSON.stringify(o); } };
  }
  if (type === "prompt_lab" || type === "speed_prompt") {
    const o = JSON.parse(ca);
    push(o.scenario, (t) => { o.scenario = t; });
    push(o.ideal_prompt, (t) => { o.ideal_prompt = t; });
    (o.tips || []).forEach((tip, i) => push(tip, (t) => { o.tips[i] = t; }));
    (o.scoring_criteria || []).forEach((c, ci) => {
      push(c.label, (t) => { o.scoring_criteria[ci].label = t; });
      (c.keyword_group || []).forEach((kw, ki) => push(kw, (t) => { o.scoring_criteria[ci].keyword_group[ki] = t; }));
    });
    return { strings, rebuild: (tr) => { setters.forEach((s, i) => s(tr[i])); return JSON.stringify(o); } };
  }
  if (type === "scenario_walkthrough") {
    const o = JSON.parse(ca);
    push(o.title, (t) => { o.title = t; });
    (o.steps || []).forEach((step, si) => {
      push(step.text, (t) => { o.steps[si].text = t; });
      push(step.claude_response, (t) => { o.steps[si].claude_response = t; });
      push(step.gpt_response, (t) => { o.steps[si].gpt_response = t; });
      push(step.question, (t) => { o.steps[si].question = t; });
      push(step.feedback, (t) => { o.steps[si].feedback = t; });
      (step.options || []).forEach((opt, oi) => push(opt, (t) => { o.steps[si].options[oi] = t; }));
      (step.scoring_criteria || []).forEach((c, ci) => {
        push(c.label, (t) => { o.steps[si].scoring_criteria[ci].label = t; });
        (c.keyword_group || []).forEach((kw, ki) => push(kw, (t) => { o.steps[si].scoring_criteria[ci].keyword_group[ki] = t; }));
      });
    });
    return { strings, rebuild: (tr) => { setters.forEach((s, i) => s(tr[i])); return JSON.stringify(o); } };
  }
  throw new Error("no collector for type " + type);
}

function structSig(v) {
  if (Array.isArray(v)) return "[" + v.map(structSig).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + structSig(v[k])).join(",") + "}";
  if (typeof v === "string") return "S";
  return JSON.stringify(v);
}
function guard(type, src, out) {
  if (type === "matching_pairs") {
    const sk = Object.keys(src), ok = Object.keys(out), ov = Object.values(out);
    if (ok.length !== sk.length) return `matching_pairs pair-count collision ${sk.length}->${ok.length}`;
    if (new Set(ov).size !== new Set(Object.values(src)).size) return "matching_pairs definition collision";
    if (ok.some((k) => !k || !k.trim()) || ov.some((v) => typeof v !== "string" || !v.trim())) return "matching_pairs empty key/value";
    return "";
  }
  if (structSig(src) !== structSig(out)) return "STRUCTURAL DRIFT (index/number/shape changed)";
  return "";
}

// Build translated correct_answer for a NEW exercise row.
// enEx: en exercise row; trOptions: already-translated options_json (or null).
// translateFn: async (strings[]) => translated[]
async function buildCorrectAnswer(enEx, trOptions, translateFn, looseEnds, unitLabel) {
  const ca = enEx.correct_answer ?? "";
  if (PRESERVE_TYPES.includes(enEx.type) || !TEXT_TYPES.includes(enEx.type)) {
    if (!PRESERVE_TYPES.includes(enEx.type)) looseEnds.push(`${unitLabel}: unknown type ${enEx.type} — correct_answer copied verbatim`);
    return ca;
  }
  if (enEx.type === "fill_blank") {
    const enOpts = enEx.options_json;
    if (!Array.isArray(enOpts) || !Array.isArray(trOptions) || enOpts.length !== trOptions.length) {
      looseEnds.push(`${unitLabel}: fill_blank options mismatch — copied verbatim`); return ca;
    }
    const map = new Map(); enOpts.forEach((w, i) => map.set(w, trOptions[i]));
    let answers;
    try { answers = JSON.parse(ca); } catch { looseEnds.push(`${unitLabel}: fill_blank answer not JSON — copied verbatim`); return ca; }
    if (!Array.isArray(answers) || answers.some((w) => !map.has(w))) {
      looseEnds.push(`${unitLabel}: fill_blank answer word not in options — copied verbatim`); return ca;
    }
    return JSON.stringify(answers.map((w) => map.get(w)));
  }
  // Gemini-translated JSON types
  let col;
  try { col = collectorFor(enEx.type, ca); }
  catch (err) { looseEnds.push(`${unitLabel}: collector error ${err.message} — copied verbatim`); return ca; }
  if (col.strings.length === 0) return ca;
  const tr = await translateFn(col.strings);
  let after;
  try { after = col.rebuild(tr); } catch (err) { looseEnds.push(`${unitLabel}: rebuild error ${err.message} — copied verbatim`); return ca; }
  const g = guard(enEx.type, JSON.parse(ca), JSON.parse(after));
  if (g) { looseEnds.push(`${unitLabel}: ${g} — copied verbatim`); return ca; }
  return after;
}

// ---------- progress ----------
const progress = { started: ts(), phase: "", done: [], failed: [], loose_ends: [] };
function saveProgress() {
  progress.updated = ts();
  progress.gemini_calls = geminiCalls;
  try { writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2)); } catch {}
}

// ---------- main ----------
async function main() {
  log(`LG l10n backlog runner start (dry-run=${DRY}) platform=${PLATFORM} locales=${LOCALES.join(",")}`);

  // Load ALL learntogpt courses (every locale) — the ONLY platform touched.
  const courses = await sbGet(`courses?select=*&platform=eq.${PLATFORM}`);
  const enCourses = courses.filter((c) => c.locale === "en").sort((a, b) => a.order_index - b.order_index);
  const courseByKey = new Map(courses.map((c) => [`${c.slug}|${c.locale}`, c]));
  log(`courses: ${courses.length} total, ${enCourses.length} en`);
  if (enCourses.length === 0) throw new Error("no en courses found for platform — refusing to proceed");

  const allCourseIds = courses.map((c) => c.id);
  const lessons = await sbGetChunkedIn("lessons", "*", "course_id", allCourseIds);
  const lessonByKey = new Map(); // cslug|locale|lslug -> lesson
  const courseById = new Map(courses.map((c) => [c.id, c]));
  for (const l of lessons) {
    const c = courseById.get(l.course_id);
    if (c) lessonByKey.set(`${c.slug}|${l.locale}|${l.slug}`, l);
  }
  const allLessonIds = lessons.map((l) => l.id);
  const exercises = await sbGetChunkedIn("exercises", "*", "lesson_id", allLessonIds);
  const exByLesson = new Map();
  for (const e of exercises) {
    if (!exByLesson.has(e.lesson_id)) exByLesson.set(e.lesson_id, []);
    exByLesson.get(e.lesson_id).push(e);
  }
  for (const arr of exByLesson.values()) arr.sort((a, b) => a.order_index - b.order_index);
  log(`lessons: ${lessons.length}, exercises: ${exercises.length} (learntogpt only)`);

  // Enumerate Phase A work
  const work = []; // {locale, kind:'course'|'lesson', enCourse, enLesson?, missingExOnly?}
  for (const locale of LOCALES) {
    for (const ec of enCourses) {
      if (!courseByKey.has(`${ec.slug}|${locale}`)) work.push({ locale, kind: "course", enCourse: ec });
      const enLessons = lessons.filter((l) => l.course_id === ec.id && l.locale === "en").sort((a, b) => a.order_index - b.order_index);
      for (const el of enLessons) {
        const twin = lessonByKey.get(`${ec.slug}|${locale}|${el.slug}`);
        if (!twin) work.push({ locale, kind: "lesson", enCourse: ec, enLesson: el });
        else {
          const enExN = (exByLesson.get(el.id) || []).length;
          const twinExN = (exByLesson.get(twin.id) || []).length;
          if (twinExN < enExN) work.push({ locale, kind: "lesson", enCourse: ec, enLesson: el, existingLesson: twin });
        }
      }
    }
  }
  const nCourses = work.filter((w) => w.kind === "course").length;
  const nLessons = work.filter((w) => w.kind === "lesson").length;
  log(`PHASE A backlog: ${nCourses} missing course rows, ${nLessons} missing/incomplete lesson rows`);
  progress.backlog = { courses: nCourses, lessons: nLessons };
  saveProgress();
  if (DRY) { for (const w of work) log("DRY", w.kind, w.enCourse.slug, w.enLesson?.slug || "", w.locale); }

  const looseEnds = progress.loose_ends;

  // ---- Phase A ----
  progress.phase = "A";
  for (const locale of LOCALES) {
    const label = LOCALE_LABELS[locale];
    const localeWork = work.filter((w) => w.locale === locale);
    if (!localeWork.length) { log(`[${locale}] nothing missing`); continue; }
    log(`[${locale}] ${localeWork.length} units`);

    // courses first (lessons need course ids)
    for (const w of localeWork.filter((x) => x.kind === "course")) {
      const ec = w.enCourse;
      const unit = `course:${ec.slug}:${locale}`;
      try {
        if (DRY) { log("DRY would insert", unit); continue; }
        const [trTitle, trDesc] = await translateAll([ec.title, ec.description || ""].map((s) => s || " "), label, unit);
        const row = {
          title: trTitle, slug: ec.slug, description: ec.description ? trDesc : ec.description,
          track: ec.track, difficulty: ec.difficulty, order_index: ec.order_index,
          is_free: ec.is_free, icon: ec.icon, lesson_count: ec.lesson_count,
          campaign_order: ec.campaign_order, level_required: ec.level_required,
          prerequisite_slug: ec.prerequisite_slug, content_type: ec.content_type, level: ec.level,
          locale, platform: PLATFORM,
        };
        const ins = await sbInsert("courses", row);
        courseByKey.set(`${ec.slug}|${locale}`, ins);
        courseById.set(ins.id, ins);
        progress.done.push(unit); saveProgress();
        log("OK", unit, ins.id);
      } catch (err) {
        logErr(unit, err.message);
        progress.failed.push(`${unit}: ${err.message}`); saveProgress();
      }
    }

    // lessons
    for (const w of localeWork.filter((x) => x.kind === "lesson")) {
      const ec = w.enCourse, el = w.enLesson;
      const unit = `lesson:${ec.slug}:${el.slug}:${locale}`;
      try {
        const enExs = (exByLesson.get(el.id) || []);
        if (DRY) { log("DRY would insert", unit, `${enExs.length} exercises`); continue; }
        const locCourse = courseByKey.get(`${ec.slug}|${locale}`);
        if (!locCourse) throw new Error("locale course row missing (course insert failed earlier?)");

        let lessonId;
        let existingExOrders = new Set();
        if (w.existingLesson) {
          lessonId = w.existingLesson.id;
          existingExOrders = new Set((exByLesson.get(lessonId) || []).map((e) => e.order_index));
          log("REPAIR", unit, `existing lesson, ${existingExOrders.size}/${enExs.length} exercises present`);
        }

        // 1. flat-collect lesson + exercise display strings
        const content = JSON.parse(JSON.stringify(el.content_json || {}));
        const strings = [], setters = [];
        const push = (v, set) => { if (typeof v === "string" && v.trim() !== "") { strings.push(v); setters.push(set); } };
        const lrow = { title: el.title, description: el.description };
        if (!w.existingLesson) {
          push(lrow.title, (t) => (lrow.title = t));
          push(lrow.description, (t) => (lrow.description = t));
          for (const sec of content.sections || []) {
            if (sec && typeof sec.content === "string") push(sec.content, (t) => (sec.content = t));
            if (sec && typeof sec.title === "string") push(sec.title, (t) => (sec.title = t));
          }
        }
        const exState = enExs.filter((e) => !existingExOrders.has(e.order_index)).map((e) => ({
          en: e,
          prompt: e.prompt, explanation: e.explanation,
          hints: Array.isArray(e.hints_json) ? [...e.hints_json] : e.hints_json,
          options: Array.isArray(e.options_json) ? [...e.options_json] : e.options_json,
        }));
        for (const st of exState) {
          push(st.prompt, (t) => (st.prompt = t));
          push(st.explanation, (t) => (st.explanation = t));
          if (Array.isArray(st.hints)) st.hints.forEach((h, i) => push(h, (t) => (st.hints[i] = t)));
          if (Array.isArray(st.options)) st.options.forEach((o, i) => push(o, (t) => (st.options[i] = t)));
        }

        // 2. translate + graft
        const translated = await translateAll(strings, label, unit);
        setters.forEach((s, i) => s(translated[i]));

        // 3. insert lesson row if new
        if (!w.existingLesson) {
          const ins = await sbInsert("lessons", {
            course_id: locCourse.id, title: lrow.title, slug: el.slug, description: lrow.description,
            order_index: el.order_index, xp_reward: el.xp_reward, estimated_minutes: el.estimated_minutes,
            content_json: content, is_free: el.is_free, locale, status: el.status,
            tutor_manifest_url: el.tutor_manifest_url,
          });
          lessonId = ins.id;
          lessonByKey.set(`${ec.slug}|${locale}|${el.slug}`, ins);
        }

        // 4. exercises (correct_answer per pinned semantics)
        for (const st of exState) {
          const exUnit = `${unit}#${st.en.order_index}:${st.en.type}`;
          const ca = await buildCorrectAnswer(st.en, st.options, (ss) => translateAll(ss, label, exUnit), looseEnds, exUnit);
          await sbInsert("exercises", {
            lesson_id: lessonId, type: st.en.type, order_index: st.en.order_index,
            prompt: st.prompt ?? "", options_json: st.options, correct_answer: ca,
            explanation: st.explanation ?? "", hints_json: st.hints ?? [],
            xp_reward: st.en.xp_reward, locale,
          });
        }
        progress.done.push(unit); saveProgress();
        log("OK", unit, `${exState.length} exercises inserted`);
      } catch (err) {
        logErr(unit, err.message);
        progress.failed.push(`${unit}: ${err.message}`); saveProgress();
      }
    }
  }

  // ---- Phase B: existing localized exercises with en-identical correct_answer ----
  progress.phase = "B";
  log("PHASE B: scanning existing localized exercises for untranslated correct_answer");
  // twin key per contamination memory: platform(course join) + course_slug + lesson_slug + order_index + type
  const enExByKey = new Map();
  for (const l of lessons.filter((x) => x.locale === "en")) {
    const c = courseById.get(l.course_id); if (!c) continue;
    for (const e of exByLesson.get(l.id) || []) enExByKey.set(`${c.slug}|${l.slug}|${e.order_index}|${e.type}`, e);
  }
  let fixed = 0;
  for (const l of lessons.filter((x) => x.locale !== "en")) {
    const c = courseById.get(l.course_id); if (!c) continue;
    for (const e of exByLesson.get(l.id) || []) {
      if (!TEXT_TYPES.includes(e.type)) continue;
      const en = enExByKey.get(`${c.slug}|${l.slug}|${e.order_index}|${e.type}`);
      if (!en) continue;
      // NEW GATE (fixes the ~235 stranded rows): detect token-level, not whole-blob.
      // Repair if the grading tokens (or any collected displayed string) are still
      // byte-identical to the en twin — regardless of whether the display text was
      // already translated on 05-31/06-15.
      if (!isStranded(en, e)) continue; // grading tokens already localized — leave it
      const unit = `fixup:${c.slug}:${l.slug}:${l.locale}#${e.order_index}:${e.type}`;
      try {
        if (DRY) { log("DRY would fix", unit); continue; }
        const label = LOCALE_LABELS[l.locale];
        if (!label) { looseEnds.push(`${unit}: unknown locale ${l.locale} — skipped`); continue; }
        // Re-derive the fully-translated correct_answer from the en twin (display text +
        // grading tokens both localized). This overwrites the partially-translated blob
        // with a fully-translated one; indices/numbers are preserved by the collectors +
        // structural guard. buildCorrectAnswer returns en verbatim only if guarded/no-op.
        const ca = await buildCorrectAnswer(en, e.options_json, (ss) => translateAll(ss, label, unit), looseEnds, unit);
        if (ca === (e.correct_answer || "")) { continue; } // no net change (defensive)
        if (ca === (en.correct_answer || "")) { looseEnds.push(`${unit}: rebuild collapsed to en (guarded) — skipped`); continue; }
        await sbPatch("exercises", `id=eq.${e.id}`, { correct_answer: ca });
        fixed++;
        progress.done.push(unit); saveProgress();
        log("OK", unit);
      } catch (err) {
        logErr(unit, err.message);
        progress.failed.push(`${unit}: ${err.message}`); saveProgress();
      }
    }
  }

  progress.phase = "done"; saveProgress();
  log(`DONE. phaseA units ok=${progress.done.filter((d) => !d.startsWith("fixup:")).length}, phaseB fixed=${fixed}, failed=${progress.failed.length}, loose_ends=${looseEnds.length}, gemini_calls=${geminiCalls}`);
  progress.failed.forEach((f) => console.log("  FAILED:", f));
  looseEnds.forEach((f) => console.log("  LOOSE:", f));
  if (progress.failed.length) process.exitCode = 1;
}

main().catch((err) => { logErr("FATAL", err); progress.fatal = String(err); saveProgress(); process.exit(1); });
