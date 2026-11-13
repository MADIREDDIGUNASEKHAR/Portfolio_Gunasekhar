export type DiagramNodeId =
  | "client"
  | "gateway"
  | "realtime"
  | "svcRider"
  | "svcPay"
  | "svcVehicle"
  | "bus"
  | "mongo"
  | "redis"
  | "llm";

export interface Interest {
  id: string;
  label: string;
  nodes: DiagramNodeId[];
}

export const interests: Interest[] = [
  { id: "arch", label: "Backend architecture", nodes: ["gateway", "svcRider", "svcPay", "svcVehicle", "bus", "mongo", "redis"] },
  { id: "dist", label: "Distributed systems", nodes: ["svcRider", "svcPay", "svcVehicle", "bus"] },
  { id: "micro", label: "Microservices", nodes: ["svcRider", "svcPay", "svcVehicle"] },
  { id: "api", label: "API design", nodes: ["gateway"] },
  { id: "db", label: "Database optimization", nodes: ["mongo", "redis"] },
  { id: "rt", label: "Real-time applications", nodes: ["realtime"] },
  { id: "ai", label: "AI-powered products", nodes: ["llm"] },
  { id: "fs", label: "Full-stack development", nodes: ["client", "gateway", "realtime", "svcRider", "svcPay", "svcVehicle"] },
];

export const stats = [
  { value: "~3", suffix: "yrs", label: "building production software" },
  { value: "10+", suffix: "", label: "microservices worked across" },
  { value: "250+", suffix: "", label: "DSA problems solved" },
  { value: "3+1", suffix: "", label: "featured GitHub projects + TradioHub" },
];

export const philosophy = [
  {
    index: "01",
    title: "Understand the problem",
    body: "Start from the business flow, not the endpoint — lifecycles, money movement and edge cases first.",
    example: "Rider-pays vs business-pays billing modelled across the full rental lifecycle.",
  },
  {
    index: "02",
    title: "Design the architecture",
    body: "Clear service boundaries, explicit contracts, and data models shaped by how they're queried.",
    example: "A referral program designed across 4 services with an admin configuration UI.",
  },
  {
    index: "03",
    title: "Build reliable systems",
    body: "Validate at the edge, enforce access by role, keep every balance reconcilable.",
    example: "Multi-stage refund approvals with payout tracking and a consistent credit ledger.",
  },
  {
    index: "04",
    title: "Optimize performance",
    body: "Measure first. Then indexes, query rewrites, caching — and fewer calls to paid APIs.",
    example: "Route-duration lookups cached in Redis to cut Google Maps cost and map load time.",
  },
  {
    index: "05",
    title: "Handle failure gracefully",
    body: "Retries with backoff, timeouts, reconciliation, and partial results when a dependency is down.",
    example: "Hotel search still answers when a supplier fails — retryable vs non-retryable errors.",
  },
  {
    index: "06",
    title: "Ship and improve",
    body: "Own it in production: deploy, watch, root-cause, fix — and make the next release better.",
    example: "Root-caused insurance double-charging and refunds issued at list price in production.",
  },
];
