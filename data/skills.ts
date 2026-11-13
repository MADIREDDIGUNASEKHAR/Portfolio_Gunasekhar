export type SkillCategoryId = "frontend" | "backend" | "databases" | "cloud" | "ai" | "fundamentals";

export interface Skill {
  name: string;
  /** Where this skill shows up in my work. Kept factual — sourced from my resume. */
  context: string;
}

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
  blurb: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "backend",
    label: "Backend",
    blurb: "Services, APIs and the plumbing between them.",
    skills: [
      { name: "Node.js", context: "10+ microservices at Hala Mobility; billing APIs at TCS." },
      { name: "Express", context: "REST APIs for the rider mobile app; the Hotel Offer Orchestrator API." },
      { name: "Go", context: "Geofencing service — PostGIS queries and the WebSocket hub." },
      { name: "Python", context: "The AI Resume Tailoring Agent pipeline." },
      { name: "REST APIs", context: "Rider-app APIs with Joi validation and JWT role-based access." },
      { name: "Microservices", context: "Rider, vehicle, payments, hub, coupon and admin services." },
      { name: "Kafka", context: "Kafka-backed microservice platform at Hala Mobility." },
      { name: "Temporal", context: "Parallel supplier orchestration with timeouts and retries." },
      { name: "WebSockets", context: "Live geofence alerts with reconnect handling." },
      { name: "JWT", context: "Role-based access control across rider and admin APIs." },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    blurb: "Dashboards and tools people use all day.",
    skills: [
      { name: "React", context: "Admin dashboards at Hala, billing UIs at TCS, TradioHub, geofence dashboard." },
      { name: "Next.js", context: "TradioHub dashboards with SSR/SSG — 25% faster page loads." },
      { name: "Redux Toolkit", context: "State and RTK Query in Hala Mobility's admin console." },
      { name: "TypeScript", context: "Hotel Offer Orchestrator and the geofencing dashboard." },
      { name: "JavaScript", context: "ES6+ across Node.js services and React frontends." },
      { name: "Material UI", context: "Internal fleet and operations dashboards at Hala Mobility." },
      { name: "Tailwind CSS", context: "Utility-first styling — including this site." },
      { name: "Leaflet", context: "Interactive geofence drawing on the map." },
      { name: "HTML", context: "Semantic, accessible markup." },
      { name: "CSS", context: "Responsive layouts and interface polish." },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    blurb: "Data models that fit the access patterns.",
    skills: [
      { name: "MongoDB", context: "Index tuning and aggregation pipeline rewrites for slow admin endpoints." },
      { name: "PostgreSQL", context: "Geofences and events for the alert system." },
      { name: "PostGIS", context: "ST_Covers point-in-polygon on a GIST-indexed geography column." },
      { name: "Redis", context: "API caching at Hala; sorted sets + MULTI/EXEC in the orchestrator." },
      { name: "SQL", context: "Normalized schemas for trades, PnL, strategy tags and journaling." },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    blurb: "Getting it deployed and keeping it running.",
    skills: [
      { name: "AWS EC2", context: "Feature deployments at Hala Mobility." },
      { name: "S3", context: "Storage on the Hala Mobility platform." },
      { name: "Lambda", context: "Part of my AWS toolkit." },
      { name: "Docker", context: "Service deployments at Hala; Docker Compose for project stacks." },
      { name: "Kubernetes", context: "Part of my container toolkit." },
      { name: "GitHub Actions", context: "CI automation." },
    ],
  },
  {
    id: "ai",
    label: "AI",
    blurb: "Building with models, and building faster with them.",
    skills: [
      { name: "LLM APIs", context: "Groq-hosted Llama 3-70B in the resume tailoring agent." },
      { name: "Claude Code", context: "Agentic coding in my day-to-day workflow." },
      { name: "Codex", context: "AI-assisted development." },
      { name: "GitHub Copilot", context: "In-editor AI assistance." },
    ],
  },
  {
    id: "fundamentals",
    label: "Fundamentals",
    blurb: "The things that outlast any framework.",
    skills: [
      { name: "DSA", context: "250+ problems solved." },
      { name: "System Design", context: "Service boundaries, failure modes, caching and data flow." },
      { name: "LLD", context: "Low-level design of services and modules." },
      { name: "Design Patterns", context: "Applied where they simplify, not by default." },
      { name: "OOP", context: "Object-oriented modelling and design." },
    ],
  },
];

/** Skills that are used together in my work — drawn as links in the constellation. */
export const skillLinks: [string, string][] = [
  ["Go", "PostGIS"],
  ["PostGIS", "PostgreSQL"],
  ["Go", "WebSockets"],
  ["WebSockets", "React"],
  ["React", "Leaflet"],
  ["React", "Redux Toolkit"],
  ["Redux Toolkit", "Material UI"],
  ["Node.js", "Kafka"],
  ["Node.js", "MongoDB"],
  ["Node.js", "Redis"],
  ["Express", "JWT"],
  ["Temporal", "Redis"],
  ["Temporal", "TypeScript"],
  ["Next.js", "SQL"],
  ["Python", "LLM APIs"],
  ["Docker", "AWS EC2"],
  ["Microservices", "Kafka"],
  ["System Design", "Microservices"],
  ["DSA", "System Design"],
  ["Claude Code", "TypeScript"],
];

export const marqueeSkills = [
  "Node.js",
  "Go",
  "React",
  "Next.js",
  "TypeScript",
  "Kafka",
  "Temporal",
  "Redis",
  "MongoDB",
  "PostgreSQL",
  "PostGIS",
  "WebSockets",
  "Docker",
  "AWS",
  "LLM APIs",
];
