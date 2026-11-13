export interface ExperienceGroup {
  title: string;
  items: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  current?: boolean;
  context: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  highlights: string[];
  breakdown: ExperienceGroup[];
  relatedProject?: string;
}

export const experience: Experience[] = [
  {
    id: "hala",
    company: "Hala Mobility",
    role: "Software Developer",
    period: "Jul 2026 — Present",
    current: true,
    context: "EV rental and fleet platform — 10+ Node.js microservices and a React admin console.",
    stack: [
      "Node.js",
      "Express",
      "Kafka",
      "MongoDB",
      "Redis",
      "React",
      "Redux Toolkit",
      "Material UI",
      "JWT",
      "Joi",
      "AWS EC2",
      "S3",
      "Docker",
    ],
    metrics: [
      { value: "10+", label: "microservices shipped across" },
      { value: "4", label: "services in the referral program" },
      { value: "E2E", label: "ownership — design to AWS deploy" },
    ],
    highlights: [
      "Owned a third-party insurance integration end-to-end across the rental lifecycle — activation, extension and deactivation of cover, rider-pays vs business-pays billing, with retry, backoff and reconciliation.",
      "Built a multi-stage refund approval workflow for wallet and security-deposit refunds, with payout tracking and a consistent credit ledger.",
      "Cut Google Maps API cost and map load time by caching route-duration lookups in Redis, limiting ETA calculation to the nearest candidates and reducing polling.",
    ],
    breakdown: [
      {
        title: "Platform & APIs",
        items: [
          "Shipped features across 10+ Node.js microservices (rider, vehicle, payments, hub, coupon and admin), owning each from design through development, AWS deployment (EC2, S3, Docker) and maintenance.",
          "Built secure, scalable REST APIs (Node.js / Express) powering the rider mobile app on a Kafka-backed microservice platform, with JWT role-based access, Joi validation and Redis caching.",
        ],
      },
      {
        title: "Payments & billing",
        items: [
          "Owned the insurance integration across activation, extension and deactivation of cover, rider-pays vs business-pays billing, and retry with backoff and reconciliation.",
          "Root-caused and fixed production billing bugs, including insurance double-charging, paid rent not extending expiry, and refunds issued at list price instead of the amount paid.",
          "Built a multi-stage refund approval workflow for wallet and security-deposit refunds, with payout tracking and a consistent credit ledger.",
        ],
      },
      {
        title: "Performance",
        items: [
          "Optimized slow admin endpoints with MongoDB indexes, aggregation pipeline rewrites and Redis caching.",
          "Cut Google Maps API cost and map load time by caching route-duration lookups in Redis, limiting ETA calculation to the nearest candidates and reducing polling.",
        ],
      },
      {
        title: "Product & integrations",
        items: [
          "Built a rider referral program across 4 services with plan-based and streak-tier rewards, cash or rent-extension payouts, and an admin configuration UI.",
          "Built KYC flows — DigiLocker, offline Aadhaar QR and PAN verification.",
          "Built a geofenced vehicle-return gate with a per-hub configurable radius and a manual override dashboard.",
          "Developed responsive React frontends (Redux Toolkit, Material UI) for internal dashboards and operational tools used across teams to manage the fleet and last-mile operations.",
        ],
      },
    ],
  },
  {
    id: "tcs",
    company: "Tata Consultancy Services",
    role: "Software Developer",
    period: "Apr 2024 — Jul 2026",
    context: "Production MERN modules for equipment charge management and payment workflows.",
    stack: ["MongoDB", "Express", "React", "Node.js", "REST APIs"],
    metrics: [
      { value: "30%", label: "faster charge processing" },
      { value: "40%", label: "fewer manual errors" },
    ],
    highlights: [
      "Built production-grade MERN modules for equipment charge management and payment workflows, improving charge-processing speed by 30% through optimized API flows and React UI.",
      "Designed React components for adding, selecting, updating and validating customer charge items — reducing manual errors by 40% with robust validation and clean UX.",
      "Integrated an external billing platform to auto-generate invoices per billing cycle.",
    ],
    breakdown: [
      {
        title: "Billing & charge management",
        items: [
          "Built full-stack MERN modules for equipment charge management and payment workflows, improving charge-processing speed by 30%.",
          "Designed React components for adding, selecting, updating and validating customer charge items; reduced manual errors by 40% with robust form validation.",
          "Developed Node.js / Express APIs to handle billing logic, process charge data and manage customer transactions securely across multiple provisioning workflows.",
        ],
      },
      {
        title: "Integrations",
        items: [
          "Integrated an external billing platform to auto-generate invoices per billing cycle, ensuring accurate end-to-end invoice creation.",
        ],
      },
      {
        title: "Production stability",
        items: [
          "Investigated and fixed production bugs, optimized API payloads and improved UI responsiveness — increasing system stability and reducing incident turnaround.",
        ],
      },
    ],
  },
  {
    id: "tradiohub",
    company: "TradioHub",
    role: "Full-Stack Intern",
    period: "Sep 2023 — Mar 2024",
    context: "AI-powered trading journal & analytics platform.",
    stack: ["React", "Next.js", "Node.js", "SQL", "Firebase", "AWS"],
    metrics: [
      { value: "90%", label: "less manual data entry" },
      { value: "25%", label: "faster page loads" },
      { value: "35%", label: "better workflow efficiency" },
    ],
    highlights: [
      "Architected and delivered the platform end-to-end — React, Next.js, Node.js, SQL, Firebase and AWS.",
      "Integrated broker REST APIs to auto-import trade history, eliminating 90% of manual data entry.",
      "Built dashboards with Next.js SSR/SSG, cutting page load times by 25%.",
    ],
    breakdown: [
      {
        title: "Product & architecture",
        items: [
          "Architected and delivered a full-stack trading journal and analytics platform end-to-end, improving user workflow efficiency by 35%.",
          "Built dynamic dashboards with Next.js SSR/SSG, cutting page load times by 25% and improving responsiveness across devices.",
        ],
      },
      {
        title: "Data & integrations",
        items: [
          "Designed normalized SQL schemas for trades, PnL metrics, strategy tags and journaling data, supporting efficient analytics.",
          "Integrated broker REST APIs to auto-import trade history, eliminating 90% of manual data entry.",
          "Implemented a secure subscription and payment system.",
        ],
      },
    ],
    relatedProject: "tradiohub",
  },
];

export const education = [
  {
    school: "Scaler Academy",
    program: "Software and AI Engineering Program",
    detail: "Specialisation in Software Development & Gen AI Fundamentals",
    period: "2023 — 2025",
  },
  {
    school: "SRM University, Chennai",
    program: "B.Tech, Electronics & Communication Engineering",
    period: "2019 — 2023",
  },
];
