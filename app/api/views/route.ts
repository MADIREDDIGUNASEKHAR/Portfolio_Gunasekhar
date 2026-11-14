import { connection } from "next/server";
import { viewsStore } from "@/lib/views-store";

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|whatsapp|telegram/i;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Current totals. */
export async function GET() {
  await connection(); // always run at request time — never prerender a counter
  if (!viewsStore) return json({ enabled: false });
  try {
    return json({ enabled: true, ...(await viewsStore.read()) });
  } catch {
    return json({ enabled: false }, 503);
  }
}

/** Record one view (the client calls this once per browser session) and return totals. */
export async function POST(request: Request) {
  if (!viewsStore) return json({ enabled: false });
  try {
    const ua = request.headers.get("user-agent") ?? "";
    const stats = BOT_UA.test(ua) ? await viewsStore.read() : await viewsStore.increment();
    return json({ enabled: true, ...stats });
  } catch {
    return json({ enabled: false }, 503);
  }
}
