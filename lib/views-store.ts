import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { siteConfig } from "@/config/site";

/**
 * Page-view storage.
 *
 * - Production: Upstash Redis over its REST API (set UPSTASH_REDIS_REST_URL and
 *   UPSTASH_REDIS_REST_TOKEN — the Vercel ↔ Upstash integration adds these, or use
 *   KV_REST_API_URL / KV_REST_API_TOKEN).
 * - Local / self-hosted: a JSON file in `.data/views.json`.
 * - On serverless hosts without Redis there is no durable disk, so the counter is
 *   disabled rather than showing numbers that silently reset.
 *
 * Only aggregate counts are stored — no IPs, cookies or user agents.
 */

export interface ViewStats {
  total: number;
  today: number;
  /** Last 14 days (oldest → newest), IST calendar days. */
  days: { date: string; count: number }[];
}

const HISTORY_DAYS = 14;
const TOTAL_KEY = "portfolio:views:total";
const DAILY_KEY = "portfolio:views:daily";

/** YYYY-MM-DD in the site owner's time zone (IST). */
function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: siteConfig.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function lastDays(now = new Date()) {
  return Array.from({ length: HISTORY_DAYS }, (_, i) => dayKey(new Date(now.getTime() - (HISTORY_DAYS - 1 - i) * 86_400_000)));
}

/* ───────────── Upstash Redis (REST) ───────────── */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

async function redisPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${redisUrl}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis responded ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = data.find((d) => d.error);
  if (failed) throw new Error(failed.error);
  return data.map((d) => d.result);
}

const redisStore = {
  async read(): Promise<ViewStats> {
    const days = lastDays();
    const [total, counts] = await redisPipeline([
      ["GET", TOTAL_KEY],
      ["HMGET", DAILY_KEY, ...days],
    ]);
    return toStats(Number(total ?? 0), days, (counts as (string | null)[]).map((c) => Number(c ?? 0)));
  },
  async increment(): Promise<ViewStats> {
    const days = lastDays();
    const [total, , counts] = await redisPipeline([
      ["INCR", TOTAL_KEY],
      ["HINCRBY", DAILY_KEY, days[days.length - 1], 1],
      ["HMGET", DAILY_KEY, ...days],
    ]);
    return toStats(Number(total), days, (counts as (string | null)[]).map((c) => Number(c ?? 0)));
  },
};

/* ───────────── Local JSON file ───────────── */

interface FileData {
  total: number;
  daily: Record<string, number>;
}

const filePath = path.join(process.cwd(), ".data", "views.json");
let queue: Promise<unknown> = Promise.resolve();

async function readFileData(): Promise<FileData> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<FileData>;
    return { total: Number(parsed.total ?? 0), daily: parsed.daily ?? {} };
  } catch {
    return { total: 0, daily: {} };
  }
}

const fileStore = {
  async read(): Promise<ViewStats> {
    const data = await readFileData();
    const days = lastDays();
    return toStats(data.total, days, days.map((d) => data.daily[d] ?? 0));
  },
  increment(): Promise<ViewStats> {
    // Serialize writes within this process so concurrent requests don't lose counts.
    const run = queue.then(async () => {
      const data = await readFileData();
      const days = lastDays();
      const today = days[days.length - 1];
      data.total += 1;
      data.daily[today] = (data.daily[today] ?? 0) + 1;
      await mkdir(path.dirname(filePath), { recursive: true });
      const tmp = `${filePath}.tmp`;
      await writeFile(tmp, JSON.stringify(data, null, 2));
      await rename(tmp, filePath); // atomic replace
      return toStats(data.total, days, days.map((d) => data.daily[d] ?? 0));
    });
    queue = run.catch(() => {});
    return run;
  },
};

/* ───────────── Selection ───────────── */

function toStats(total: number, days: string[], counts: number[]): ViewStats {
  return {
    total,
    today: counts[counts.length - 1] ?? 0,
    days: days.map((date, i) => ({ date, count: counts[i] ?? 0 })),
  };
}

const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const viewsStore = redisUrl && redisToken ? redisStore : isServerless ? null : fileStore;
