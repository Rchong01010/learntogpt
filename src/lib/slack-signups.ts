/**
 * Unified Slack pings for the #signups channel.
 *
 * Throws at call time if SLACK_SIGNUP_WEBHOOK is missing — crash loud on
 * misconfiguration. Filters null/undefined/empty fields. Best-effort
 * fire-and-log once validated.
 */

export async function pingSignupSlack(opts: {
  tag: string; // "Academy" | "GA"
  title: string; // "paid signup" | "free signup" | "ring builder" | etc
  emoji?: string; // ":moneybag:" | ":wave:" | ":handshake:" | ":ring:" | ":mailbox_with_mail:"
  fields: Array<[string, string | null | undefined]>;
}): Promise<{ ok: boolean }> {
  const webhook = (process.env.SLACK_SIGNUP_WEBHOOK ?? "").trim();
  if (!webhook) {
    throw new Error("Missing SLACK_SIGNUP_WEBHOOK");
  }

  try {
    const emoji = opts.emoji ? `${opts.emoji} ` : "";
    const header = `${emoji}*[${opts.tag}] ${opts.title}*`;
    const fieldLines = opts.fields
      .filter(([, v]) => v !== null && v !== undefined && String(v).length > 0)
      .map(([k, v]) => `• ${k}: ${v}`);
    const text = [header, ...fieldLines].join("\n");

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(`[signup-slack] HTTP ${res.status}: ${body}`);
      return { ok: false };
    }

    console.log(`[signup-slack] sent: [${opts.tag}] ${opts.title}`);
    return { ok: true };
  } catch (err) {
    console.error(
      "[signup-slack] threw:",
      err instanceof Error ? err.message : String(err),
    );
    return { ok: false };
  }
}
