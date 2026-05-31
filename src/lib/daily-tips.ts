/**
 * 30 rotating daily tips for Learn to GPT.
 *
 * Each tip teaches ONE useful thing about ChatGPT in ~60 seconds of reading.
 * The active tip is deterministic — everyone sees the same one on the same
 * calendar day (UTC), same approach as daily challenges.
 */

export interface DailyTip {
  id: number;
  title: string;
  body: string;
  category: "prompting" | "workflow" | "feature" | "mindset";
  proTip?: string;
}

const tips: DailyTip[] = [
  // ── Prompting ────────────────────────────────────────────
  {
    id: 1,
    title: "Start with the output format",
    body: "Tell ChatGPT what the output should look like before explaining the task. 'Give me a bullet list of...' or 'Write a 3-paragraph summary of...' works better than describing the task and hoping for the right format.",
    category: "prompting",
    proTip: "Combine format + length: 'Give me a 5-row markdown table comparing...'",
  },
  {
    id: 2,
    title: "The XML tag trick",
    body: "Wrap different types of input in XML tags like <context> and <instructions>. ChatGPT treats tagged sections as distinct inputs, which dramatically improves accuracy on complex prompts.",
    category: "prompting",
    proTip: "Use <example> tags to show ChatGPT what good output looks like.",
  },
  {
    id: 3,
    title: "Chain of thought on demand",
    body: "When ChatGPT rushes to a wrong answer, add 'Think step by step' or 'Walk through your reasoning before answering.' This slows it down and makes it show its work, which usually leads to better answers on math, logic, and multi-step problems.",
    category: "prompting",
  },
  {
    id: 4,
    title: "Role prompting changes everything",
    body: "'You are a senior data analyst' changes ChatGPT's entire approach. The more specific the role, the better: 'You are a fintech compliance officer reviewing this feature for regulatory risk' beats 'You are an expert.'",
    category: "prompting",
    proTip: "Stack roles: 'You are a senior engineer who also has a background in UX research.'",
  },
  {
    id: 5,
    title: "Few-shot examples beat long instructions",
    body: "Show ChatGPT 2-3 examples of what you want before asking it to produce more. it pattern-matches from examples better than it follows abstract descriptions of style or format. This is the single most effective way to get consistent output.",
    category: "prompting",
  },
  {
    id: 6,
    title: "Constrain the length",
    body: "ChatGPT tends to be thorough, which sometimes means verbose. If you want a concise answer, set an explicit constraint: 'Answer in under 50 words' or 'Give me the three most important points only.' Length constraints force ChatGPT to prioritize.",
    category: "prompting",
    proTip: "Use 'one sentence' or 'one paragraph' for truly tight constraints.",
  },
  {
    id: 7,
    title: "The 3-sentence system prompt",
    body: "You do not need a 500-word system prompt. Three sentences work: who ChatGPT should be, what it should do, and how it should respond. 'You are a marketing strategist. Help me write LinkedIn posts. Be direct and avoid jargon.'",
    category: "prompting",
  },
  {
    id: 8,
    title: "Negative instructions work",
    body: "Telling ChatGPT what NOT to do is surprisingly effective. 'Do not use bullet points.' 'Do not include disclaimers.' 'Do not explain concepts I already know.' ChatGPT follows negative constraints well when they are specific.",
    category: "prompting",
    proTip: "Pair a negative with a positive: 'Do not use jargon. Use plain English instead.'",
  },

  // ── Workflow ─────────────────────────────────────────────
  {
    id: 9,
    title: "Custom Instructions are your persistent memory",
    body: "Set up Custom Instructions in ChatGPT Settings → Personalization. Put your role, preferred response format, and things ChatGPT should always or never do. It is the fastest way to get consistent responses without repeating yourself every session.",
    category: "workflow",
  },
  {
    id: 10,
    title: "Don't start over — extend",
    body: "When ChatGPT's response is close but not right, say 'Keep everything but change X.' Starting a new conversation loses all the context ChatGPT built up about your task. Each follow-up makes the next response better.",
    category: "workflow",
    proTip: "Stack multiple changes: 'Keep the structure but make it shorter, add an example to point 2, and change the tone to be more casual.'",
  },
  {
    id: 11,
    title: "Start a new chat when you switch topics",
    body: "ChatGPT carries all prior context into every new message. When you switch to a different task, start a fresh conversation — otherwise old context bleeds in and degrades response quality. One project, one conversation. New project, new chat.",
    category: "workflow",
  },
  {
    id: 12,
    title: "Upload files directly for better analysis",
    body: "Instead of copy-pasting content, upload files directly to ChatGPT. It can read PDFs, CSVs, Excel files, and images without any preprocessing. Use Code Interpreter for data files that need real computation, or just drop files into chat for reading and analysis.",
    category: "workflow",
  },
  {
    id: 13,
    title: "Use Custom GPTs for repeatable workflows",
    body: "The GPT Store has pre-built Custom GPTs for specific tasks — brand voice, data analysis, code review, writing assistance. When you find yourself giving ChatGPT the same setup instructions repeatedly, there's probably a Custom GPT for it, or you can build one yourself.",
    category: "workflow",
  },
  {
    id: 14,
    title: "Save your best prompts",
    body: "When a prompt works really well, save it somewhere. Build a personal prompt library for tasks you repeat: weekly reports, code reviews, meeting prep, content drafts. Your prompts get better over time and become genuine productivity tools.",
    category: "workflow",
    proTip: "Keep a 'prompts.md' file in your project.",
  },
  {
    id: 15,
    title: "Break big tasks into steps",
    body: "Instead of asking ChatGPT to do everything at once, break complex tasks into 2-3 steps. First outline, then draft, then refine. Each step gives you a checkpoint to redirect before ChatGPT goes too far in the wrong direction.",
    category: "workflow",
  },
  {
    id: 16,
    title: "Use Projects for persistent context",
    body: "ChatGPT Projects on chatgpt.com save context between conversations. Set up a project per repo or per workstream, add your key docs, and write project instructions once. Every new conversation in that project starts with full context.",
    category: "workflow",
  },

  // ── Feature ──────────────────────────────────────────────
  {
    id: 17,
    title: "ChatGPT reads images",
    body: "Drag a screenshot, whiteboard photo, or diagram into your conversation. ChatGPT can read handwriting, parse charts, and extract data from images. No need to type out what you can photograph.",
    category: "feature",
    proTip: "Take a photo of a handwritten list, paste it in, and ask ChatGPT to turn it into a spreadsheet.",
  },
  {
    id: 18,
    title: "Extended thinking for hard problems",
    body: "ChatGPT can think before responding. Toggle extended thinking for problems that need deeper reasoning: debugging tricky code, analyzing complex tradeoffs, or working through multi-step logic. The thinking is visible so you can follow along.",
    category: "feature",
  },
  {
    id: 19,
    title: "Canvas for long-form collaborative editing",
    body: "When you need to edit a long document without regenerating the whole thing, switch to Canvas. It opens a persistent document editor alongside the chat so ChatGPT can make targeted edits to specific sections. Great for proposals, reports, and long-form writing.",
    category: "feature",
  },
  {
    id: 20,
    title: "Browse with Bing for real-time information",
    body: "ChatGPT's training has a knowledge cutoff. Enable Browse with Bing when you need current information — recent news, live pricing, regulatory updates, or anything that changes frequently. Without it, ChatGPT can only draw on what it learned during training.",
    category: "feature",
  },
  {
    id: 21,
    title: "DALL-E for quick visual assets",
    body: "ChatGPT can generate images directly via DALL-E. Describe the composition, style, mood, and what to exclude. Use it for mockups, concept illustrations, and social media graphics. Prompt quality matters — the more specific your description, the closer the result.",
    category: "feature",
  },
  {
    id: 22,
    title: "ChatGPT reads PDFs natively",
    body: "Upload a PDF directly into your conversation. ChatGPT can read, summarize, and answer questions about the document without any preprocessing. Works with contracts, research papers, financial reports, and manuals.",
    category: "feature",
    proTip: "Ask ChatGPT to 'pull out the key numbers' from a financial PDF for instant analysis.",
  },

  // ── Mindset ──────────────────────────────────────────────
  {
    id: 23,
    title: "Context is everything",
    body: "The quality of ChatGPT's output is directly proportional to the context you give it. A vague prompt gets a generic answer. A prompt with background, constraints, audience, and desired format gets a sharp answer. Spending 30 extra seconds on context saves minutes of back-and-forth.",
    category: "mindset",
  },
  {
    id: 24,
    title: "The pre-mortem prompt",
    body: "Ask ChatGPT: 'What could go wrong with this plan?' before committing. ChatGPT is genuinely good at finding failure modes you haven't considered. Works for code architecture, business plans, email drafts, and project plans alike.",
    category: "mindset",
  },
  {
    id: 25,
    title: "Steelman then decide",
    body: "When you are leaning toward one option, ask ChatGPT to argue FOR the option you are leaning against. This forces you to consider the strongest version of the alternative before committing. Better decisions come from understanding what you are giving up.",
    category: "mindset",
  },
  {
    id: 26,
    title: "Be specific about 'better'",
    body: "'Make this better' fails because ChatGPT does not know which dimension you care about. 'Make this shorter and more direct' works. 'Add more technical depth to section 2' works. 'Rewrite for a CEO audience who has 30 seconds' works. Name the axis of improvement.",
    category: "mindset",
  },
  {
    id: 27,
    title: "Trust but verify",
    body: "ChatGPT is confident even when wrong. It will not hedge when it should, especially on specific facts, dates, and code edge cases. Use ChatGPT's output as a strong starting point, then verify the parts that matter. This is especially true for code: always test it.",
    category: "mindset",
  },
  {
    id: 28,
    title: "ChatGPT is not Google",
    body: "Do not search — describe. Instead of asking ChatGPT to find something, describe your problem and ask for a solution. 'I have an array of objects with a date field and need to sort them newest-first' beats 'What is the JavaScript sort function?'",
    category: "mindset",
  },
  {
    id: 29,
    title: "The persona switcheroo",
    body: "Ask ChatGPT to review its own output from a different perspective. Write marketing copy, then ask ChatGPT to critique it as a skeptical customer. Draft a technical plan, then ask ChatGPT to poke holes as a senior engineer. Two perspectives, one conversation.",
    category: "mindset",
    proTip: "Ask 'Now read this as a busy VP who gets 200 emails a day. What would you skip?'",
  },
  {
    id: 30,
    title: "Use ChatGPT as a second reader",
    body: "Before you send an important email, post a message, or submit a document, paste it into ChatGPT and ask: 'Read this as [specific audience]. What is unclear? What would you push back on?' ChatGPT catches awkward phrasing, logical gaps, and tone mismatches you have gone blind to.",
    category: "mindset",
  },
];

/**
 * Returns the tip for a specific day offset from today.
 * offset=0 is today, offset=-1 is yesterday, offset=1 is tomorrow.
 * Deterministic — everyone gets the same tip on the same calendar day (UTC).
 */
export function getTipByOffset(offset: number): DailyTip {
  const dayIndex =
    ((Math.floor(Date.now() / 86_400_000) + offset) % tips.length + tips.length) %
    tips.length;
  return tips[dayIndex];
}

/**
 * Returns the tip for today. Deterministic — everyone gets the same
 * tip on the same calendar day (UTC).
 */
export function getTodayTip(): DailyTip {
  return getTipByOffset(0);
}

/**
 * Returns the tip for tomorrow.
 */
export function getTomorrowTip(): DailyTip {
  return getTipByOffset(1);
}

/**
 * Returns tips for the last N days (today first, then yesterday, etc.).
 */
export function getRecentTips(days: number): DailyTip[] {
  const result: DailyTip[] = [];
  for (let i = 0; i < days; i++) {
    result.push(getTipByOffset(-i));
  }
  return result;
}

/**
 * Returns all 30 tips (useful for the tips archive page).
 */
export function getDailyTips(): DailyTip[] {
  return tips;
}
