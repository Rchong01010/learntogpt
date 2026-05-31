/**
 * Post-deploy IndexNow ping script.
 *
 * Usage: npx tsx scripts/ping-indexnow.ts
 *
 * Fetches sitemap.xml from learntogpt.com, extracts all URLs,
 * and submits them to the IndexNow API (Bing, Yandex, Naver, etc.)
 * in batches of up to 10,000 URLs.
 *
 * Requires:
 *   INDEXNOW_SECRET — the IndexNow API key (must match the key file
 *                     hosted at /<key>.txt on the site)
 */

const SITE_URL = "https://learntogpt.com";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000;

async function fetchSitemap(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL, { headers: { "User-Agent": "IndexNow-Ping/1.0" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  // Extract all <loc>...</loc> URLs from the sitemap XML
  const urls: string[] = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function pingIndexNow(urls: string[], key: string): Promise<void> {
  // Batch URLs into groups of BATCH_SIZE
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(urls.length / BATCH_SIZE);

    console.log(
      `Submitting batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`
    );

    const body = {
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: batch,
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    if (res.ok || res.status === 202) {
      console.log(`  Batch ${batchNum}: accepted (${res.status})`);
    } else {
      const text = await res.text().catch(() => "");
      console.error(
        `  Batch ${batchNum}: FAILED (${res.status}) ${text}`
      );
    }

    // Small delay between batches to be polite
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function main(): Promise<void> {
  const key = process.env.INDEXNOW_SECRET;
  if (!key) {
    console.error("Error: INDEXNOW_SECRET environment variable is required.");
    console.error("Set it to your IndexNow API key before running this script.");
    process.exit(1);
  }

  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const urls = await fetchSitemap();
  console.log(`Found ${urls.length} URLs in sitemap.`);

  if (urls.length === 0) {
    console.log("No URLs to submit. Exiting.");
    return;
  }

  await pingIndexNow(urls, key);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
