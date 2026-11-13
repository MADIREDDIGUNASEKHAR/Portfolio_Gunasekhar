export type ProjectVisual = "geofence" | "orchestrator" | "pipeline" | "trading";

export type ArchKind = "client" | "service" | "data" | "external" | "infra";

export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  kind: ArchKind;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  tagline: string;
  category: string;
  problem: string;
  summary: string;
  highlights: string[];
  stack: string[];
  repo?: string;
  repoNote?: string;
  visual: ProjectVisual;
  architecture: {
    cols: number;
    rows: number;
    nodes: ArchNode[];
    edges: ArchEdge[];
    caption: string;
  };
  decisions: { title: string; body: string }[];
  implementation: string[];
  challenges: { challenge: string; approach: string }[];
  snippets: { label: string; lang: string; code: string }[];
}

export const projects: Project[] = [
  {
    slug: "geofencing-realtime-alert-system",
    index: "01",
    title: "Geofencing & Real-Time Alert System",
    shortTitle: "Geofencing",
    tagline: "Draw a zone. Know the instant a vehicle crosses it.",
    category: "Real-time · Geospatial",
    problem:
      "Fleet operators need to know the moment a vehicle enters or leaves an area that matters — a hub, a depot, a restricted zone — not minutes later in a report.",
    summary:
      "A full-stack vehicle-tracking platform where operators draw polygonal geofences on a map and receive live alerts when a vehicle enters or exits a zone, with a filterable history of every event.",
    highlights: [
      "Entry/exit detection in Go using PostGIS point-in-polygon — ST_Covers on a GIST-indexed geography column — diffed against each vehicle's previous zone state.",
      "Alerts pushed to a React + Leaflet dashboard through a WebSocket hub with reconnect handling.",
      "Location endpoint protected with per-IP token-bucket rate limiting and optional API-key auth.",
    ],
    stack: ["Go", "PostgreSQL", "PostGIS", "WebSockets", "React", "TypeScript", "Leaflet", "Docker Compose"],
    repo: "https://github.com/MADIREDDIGUNASEKHAR/geofencing-realtime-alert-system",
    visual: "geofence",
    architecture: {
      cols: 4,
      rows: 3,
      caption: "Location updates flow left to right; alerts flow back to the dashboard over WebSockets.",
      nodes: [
        { id: "tracker", label: "Vehicle feed", sub: "location updates", col: 0, row: 0, kind: "external" },
        { id: "gate", label: "Location endpoint", sub: "token bucket · API key", col: 1, row: 0, kind: "service" },
        { id: "api", label: "Go service", sub: "zone-state diff", col: 2, row: 1, kind: "service" },
        { id: "pg", label: "PostgreSQL + PostGIS", sub: "ST_Covers · GIST", col: 3, row: 0, kind: "data" },
        { id: "events", label: "Event history", sub: "entry / exit log", col: 3, row: 2, kind: "data" },
        { id: "hub", label: "WebSocket hub", sub: "reconnect handling", col: 1, row: 2, kind: "service" },
        { id: "dash", label: "React dashboard", sub: "Leaflet · TypeScript", col: 0, row: 2, kind: "client" },
      ],
      edges: [
        { from: "tracker", to: "gate", label: "POST location" },
        { from: "gate", to: "api" },
        { from: "api", to: "pg", label: "point-in-polygon" },
        { from: "api", to: "events", label: "ENTER / EXIT" },
        { from: "api", to: "hub", label: "alert" },
        { from: "hub", to: "dash", label: "push" },
        { from: "dash", to: "api", label: "geofences", dashed: true },
      ],
    },
    decisions: [
      {
        title: "Let the database answer the geometry question",
        body: "Point-in-polygon runs in PostGIS with ST_Covers against a GIST-indexed geography column, so containment checks use a spatial index instead of looping over polygons in application code.",
      },
      {
        title: "Detect transitions, not positions",
        body: "Each location update is diffed against the vehicle's previous zone state. Only changes become ENTER or EXIT events, so the stream carries signal rather than every ping.",
      },
      {
        title: "Push, don't poll",
        body: "A WebSocket hub fans alerts out to connected dashboards, with reconnect handling so a dropped connection recovers on its own.",
      },
      {
        title: "Protect the hot endpoint",
        body: "The location endpoint takes the most traffic, so it gets per-IP token-bucket rate limiting and optional API-key authentication.",
      },
    ],
    implementation: [
      "Go backend for location ingestion, geofence management and event history.",
      "Polygonal geofences drawn interactively on a Leaflet map in a React + TypeScript dashboard.",
      "Live entry/exit alerts plus a filterable history of every event.",
      "Whole stack — Go service, PostgreSQL/PostGIS and the frontend — runs with Docker Compose.",
    ],
    challenges: [
      {
        challenge: "Duplicate alerts while a vehicle stays inside a zone",
        approach: "Compare the zones covering the new point with the previous zone state and emit only the difference.",
      },
      {
        challenge: "Keeping containment checks fast as geofences grow",
        approach: "A GIST index on a geography column lets ST_Covers use the spatial index.",
      },
      {
        challenge: "Dashboards silently dropping off the live feed",
        approach: "A WebSocket hub with reconnect handling.",
      },
      {
        challenge: "A noisy client flooding the location endpoint",
        approach: "Per-IP token-bucket rate limiting, with optional API-key auth.",
      },
    ],
    snippets: [
      {
        label: "Containment check",
        lang: "sql",
        code: `-- zones covering the vehicle's latest position
SELECT g.id
FROM   geofences g
WHERE  ST_Covers(
         g.area,                       -- geography, GIST-indexed
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       );`,
      },
      {
        label: "Transition diff",
        lang: "go",
        code: `// only changes in zone membership become events
entered := diff(current, previous) // ENTER
exited  := diff(previous, current) // EXIT
for _, z := range entered { hub.Broadcast(Event{Type: "ENTER", Zone: z}) }
for _, z := range exited  { hub.Broadcast(Event{Type: "EXIT",  Zone: z}) }`,
      },
    ],
  },
  {
    slug: "hotel-offer-orchestrator",
    index: "02",
    title: "Hotel Offer Orchestrator",
    shortTitle: "Orchestrator",
    tagline: "Many suppliers. One answer. Even when one of them is down.",
    category: "Workflow orchestration",
    problem:
      "Hotel inventory is spread across suppliers that return overlapping hotels at different prices — and any one of them can be slow or down at the moment someone searches.",
    summary:
      "A hotel-search API that queries multiple suppliers in parallel through a Temporal workflow, deduplicates hotels by name and returns the best-priced offer for each.",
    highlights: [
      "Parallel supplier calls orchestrated as a Temporal workflow, with per-call timeouts.",
      "Results kept in Redis sorted sets scored by price; the replace and price-range query run in a single MULTI/EXEC transaction so concurrent searches stay consistent.",
      "Designed for partial failure — retryable vs non-retryable errors, partial results when a supplier is down, dependency health checks — covered by a Vitest suite.",
    ],
    stack: ["Node.js", "TypeScript", "Express", "Temporal", "Redis", "Docker Compose", "Vitest"],
    repo: "https://github.com/MADIREDDIGUNASEKHAR/hotel-offer-orchestrator",
    visual: "orchestrator",
    architecture: {
      cols: 4,
      rows: 3,
      caption: "One search fans out to every supplier in parallel; results converge into a price-ordered set.",
      nodes: [
        { id: "client", label: "Client", sub: "hotel search", col: 0, row: 1, kind: "client" },
        { id: "api", label: "Express API", sub: "TypeScript", col: 1, row: 1, kind: "service" },
        { id: "wf", label: "Temporal workflow", sub: "fan-out · retries", col: 2, row: 1, kind: "service" },
        { id: "a", label: "Supplier A", sub: "activity · timeout", col: 3, row: 0, kind: "external" },
        { id: "b", label: "Supplier B", sub: "activity · timeout", col: 3, row: 1, kind: "external" },
        { id: "c", label: "Supplier C", sub: "activity · timeout", col: 3, row: 2, kind: "external" },
        { id: "merge", label: "Dedupe by name", sub: "best price per hotel", col: 2, row: 2, kind: "service" },
        { id: "redis", label: "Redis ZSET", sub: "scored by price", col: 1, row: 2, kind: "data" },
      ],
      edges: [
        { from: "client", to: "api", label: "search" },
        { from: "api", to: "wf", label: "start" },
        { from: "wf", to: "a" },
        { from: "wf", to: "b", label: "parallel" },
        { from: "wf", to: "c" },
        { from: "wf", to: "merge" },
        { from: "merge", to: "redis", label: "MULTI / EXEC" },
        { from: "redis", to: "api", label: "price range", dashed: true },
      ],
    },
    decisions: [
      {
        title: "Orchestrate with a workflow engine",
        body: "Supplier fan-out runs as a Temporal workflow, which makes parallelism, timeouts and retries explicit parts of the design rather than scattered error handling.",
      },
      {
        title: "Classify failures",
        body: "Supplier errors are split into retryable and non-retryable, so transient faults are retried while permanent ones fail fast.",
      },
      {
        title: "Degrade, don't fail",
        body: "If one supplier is down, the search still returns partial results from the others.",
      },
      {
        title: "Make the price index atomic",
        body: "Redis sorted sets are scored by price, and the replace plus price-range query run in one MULTI/EXEC transaction — concurrent searches never see a half-written result.",
      },
    ],
    implementation: [
      "Express + TypeScript API in front of the Temporal workflow.",
      "Hotels deduplicated by name, keeping the best-priced offer for each.",
      "Per-call timeouts on every supplier request.",
      "Dependency health checks for the services the API relies on.",
      "Vitest suite covering the partial-failure behaviour.",
      "Local stack runs with Docker Compose.",
    ],
    challenges: [
      {
        challenge: "One slow supplier holding up every search",
        approach: "Per-call timeouts, and partial results when a supplier can't answer.",
      },
      {
        challenge: "Retrying errors that will never succeed",
        approach: "Classify supplier errors as retryable or non-retryable.",
      },
      {
        challenge: "Concurrent searches overwriting each other's results",
        approach: "Replace and range-query inside one Redis MULTI/EXEC transaction.",
      },
      {
        challenge: "The same hotel arriving from several suppliers",
        approach: "Deduplicate by name and keep the best-priced offer.",
      },
    ],
    snippets: [
      {
        label: "Atomic replace + price range",
        lang: "ts",
        code: `// replace results and read the price window in one transaction
const results = await redis
  .multi()
  .del(key)
  .zadd(key, ...scoredOffers)          // score = price
  .zrangebyscore(key, minPrice, maxPrice)
  .exec();`,
      },
    ],
  },
  {
    slug: "ai-resume-tailoring-agent",
    index: "03",
    title: "AI Resume Tailoring Agent",
    shortTitle: "Resume Agent",
    tagline: "One job post in. One tailored application out.",
    category: "Applied AI · Automation",
    problem:
      "Tailoring a resume for every role is slow, repetitive work — and a generic resume misses the keywords and angle each role is looking for.",
    summary:
      "A Python pipeline that ingests job postings from Excel and JSON, generates a tailored DOCX resume per role with Groq (Llama 3-70B) and sends the application email.",
    highlights: [
      "A prompt layer extracts role keywords and a per-job focus angle, then reorders skills and rewrites bullets so each output is distinct.",
      "Four single-responsibility services, with retry and exponential backoff on LLM and email calls.",
      "Per-job fault isolation — one failure never stops the batch. Groq inference in 2–3s.",
    ],
    stack: ["Python", "Groq", "Llama 3-70B", "DOCX", "Gmail SMTP", "Excel", "JSON"],
    repo: "https://github.com/MADIREDDIGUNASEKHAR/ai-resume-tailoring-agent",
    visual: "pipeline",
    architecture: {
      cols: 5,
      rows: 2,
      caption: "Each job moves through the pipeline independently; flaky calls are retried, failures are contained.",
      nodes: [
        { id: "src", label: "Job postings", sub: "Excel · JSON", col: 0, row: 0, kind: "external" },
        { id: "ingest", label: "Ingest", sub: "normalize jobs", col: 1, row: 0, kind: "service" },
        { id: "prompt", label: "Prompt layer", sub: "keywords · focus angle", col: 2, row: 0, kind: "service" },
        { id: "groq", label: "Groq", sub: "Llama 3-70B", col: 2, row: 1, kind: "external" },
        { id: "docx", label: "Resume builder", sub: "tailored DOCX", col: 3, row: 0, kind: "service" },
        { id: "mail", label: "Mailer", sub: "Gmail SMTP", col: 4, row: 0, kind: "external" },
        { id: "retry", label: "Retry + backoff", sub: "LLM & email calls", col: 4, row: 1, kind: "infra" },
      ],
      edges: [
        { from: "src", to: "ingest" },
        { from: "ingest", to: "prompt" },
        { from: "prompt", to: "groq", label: "inference" },
        { from: "prompt", to: "docx", label: "rewritten bullets" },
        { from: "docx", to: "mail", label: "application" },
        { from: "retry", to: "groq", dashed: true },
        { from: "retry", to: "mail", dashed: true },
      ],
    },
    decisions: [
      {
        title: "A prompt layer, not one giant prompt",
        body: "Role keywords and a per-job focus angle are extracted first, then drive how skills are reordered and bullets rewritten — so each resume is genuinely different.",
      },
      {
        title: "Single-responsibility services",
        body: "Four services each own one step, keeping LLM, document and email concerns separate.",
      },
      {
        title: "Expect flaky dependencies",
        body: "LLM and email calls retry with exponential backoff instead of failing on the first transient error.",
      },
      {
        title: "Isolate failure per job",
        body: "A failing job is contained; the rest of the batch keeps going.",
      },
    ],
    implementation: [
      "Ingests job postings from Excel and JSON.",
      "Groq-hosted Llama 3-70B for keyword extraction and rewriting, with 2–3s inference.",
      "Generates a tailored DOCX resume per role.",
      "Sends each application email through Gmail SMTP.",
    ],
    challenges: [
      {
        challenge: "Every tailored resume reading the same",
        approach: "Extract a per-job focus angle and let it drive skill ordering and bullet rewrites.",
      },
      {
        challenge: "Transient LLM or SMTP failures",
        approach: "Retry with exponential backoff around both external calls.",
      },
      {
        challenge: "One bad posting killing a long batch",
        approach: "Per-job fault isolation.",
      },
    ],
    snippets: [
      {
        label: "Retry with exponential backoff",
        lang: "python",
        code: `def with_backoff(call, retries=3, base=1.0):
    for attempt in range(retries + 1):
        try:
            return call()
        except TransientError:
            if attempt == retries:
                raise
            time.sleep(base * 2 ** attempt)   # 1s, 2s, 4s …`,
      },
      {
        label: "Per-job fault isolation",
        lang: "python",
        code: `for job in jobs:
    try:
        process(job)                      # tailor → DOCX → email
    except Exception as err:
        failed.append((job.id, err))      # contain it; keep the batch going`,
      },
    ],
  },
  {
    slug: "tradiohub",
    index: "04",
    title: "TradioHub",
    shortTitle: "TradioHub",
    tagline: "A trading journal that fills itself in.",
    category: "Product · Analytics",
    problem:
      "Keeping a trading journal usually means copying trades by hand from a broker into spreadsheets before any analysis can start.",
    summary:
      "An AI-powered trading journal and analytics platform I architected and delivered end-to-end during my internship — broker trade imports, analytics dashboards, journaling and subscriptions.",
    highlights: [
      "Broker REST API integration auto-imports trade history — eliminating 90% of manual data entry.",
      "Dashboards built with Next.js SSR/SSG, cutting page load times by 25%.",
      "Normalized SQL schemas for trades, PnL metrics, strategy tags and journaling data, plus a secure subscription and payment system.",
    ],
    stack: ["React", "Next.js", "Node.js", "SQL", "Firebase", "AWS"],
    repoNote: "Built during my internship at TradioHub — the source isn't public.",
    visual: "trading",
    architecture: {
      cols: 3,
      rows: 2,
      caption: "High-level view: trades are imported from brokers, modelled in SQL and served to SSR/SSG dashboards.",
      nodes: [
        { id: "broker", label: "Broker APIs", sub: "trade history", col: 0, row: 0, kind: "external" },
        { id: "api", label: "Node.js API", sub: "imports · analytics", col: 1, row: 0, kind: "service" },
        { id: "sql", label: "SQL", sub: "trades · PnL · tags · journal", col: 2, row: 0, kind: "data" },
        { id: "web", label: "Next.js + React", sub: "SSR / SSG dashboards", col: 0, row: 1, kind: "client" },
        { id: "pay", label: "Subscriptions", sub: "secure payments", col: 1, row: 1, kind: "service" },
      ],
      edges: [
        { from: "broker", to: "api", label: "REST import" },
        { from: "api", to: "sql" },
        { from: "web", to: "api", label: "analytics" },
        { from: "web", to: "pay", dashed: true },
      ],
    },
    decisions: [
      {
        title: "Import, don't type",
        body: "Broker REST APIs auto-import trade history, removing 90% of the manual data entry a journal normally needs.",
      },
      {
        title: "Model the domain first",
        body: "Normalized SQL schemas for trades, PnL metrics, strategy tags and journaling data keep analytics queries straightforward.",
      },
      {
        title: "Render where it's fastest",
        body: "Dashboards use Next.js SSR/SSG, cutting page load times by 25% and improving responsiveness across devices.",
      },
      {
        title: "Monetisation built in",
        body: "A secure subscription and payment system was part of the platform from the start.",
      },
    ],
    implementation: [
      "Full-stack platform: React, Next.js, Node.js, SQL, Firebase and AWS.",
      "Trading analytics dashboards over imported trade history.",
      "Improved user workflow efficiency by 35%.",
      "Secure subscription and payment workflows.",
    ],
    challenges: [
      {
        challenge: "Manual, error-prone trade entry",
        approach: "Broker REST API integration to import trade history automatically.",
      },
      {
        challenge: "Slow, data-heavy dashboards",
        approach: "Next.js SSR/SSG — 25% faster page loads.",
      },
      {
        challenge: "Analytics across trades, tags and journal entries",
        approach: "Normalized SQL schemas designed around those queries.",
      },
    ],
    snippets: [
      {
        label: "Data model shape (illustrative, simplified)",
        lang: "sql",
        code: `trades          (id, user_id, symbol, side, qty, entry, exit, pnl, executed_at)
strategy_tags   (id, user_id, name)
trade_tags      (trade_id, tag_id)
journal_entries (id, trade_id, note, created_at)`,
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
