/**
 * Site-wide configuration: personal details, links and navigation.
 * Edit this file to update contact info or external profile links.
 */

export const siteConfig = {
  name: "Guna Sekhar Madireddi",
  shortName: "Guna",
  initials: "GS",
  title: "Full-Stack Engineer",
  roles: ["Full-Stack Engineer", "Backend Engineer", "Software Developer"],
  experience: "~3 years",
  location: "India",
  timeZone: "Asia/Kolkata",
  currentRole: { title: "Software Developer", company: "Hala Mobility" },
  available: true,

  email: "guna281sekhar@gmail.com",
  phone: "+91 95425 60328",
  phoneHref: "tel:+919542560328",

  github: {
    url: "https://github.com/MADIREDDIGUNASEKHAR",
    handle: "MADIREDDIGUNASEKHAR",
  },

  /** Set `isProfileUrl: false` if `url` is ever a search/placeholder link rather than a profile. */
  linkedin: {
    url: "https://www.linkedin.com/in/gunasekhar-madireddi-1743401b4/",
    handle: "in/gunasekhar-madireddi",
    isProfileUrl: true,
  },

  photo: {
    src: "/images/guna-sekhar-madireddi.jpg",
    alt: "Portrait of Guna Sekhar Madireddi",
  },

  resume: {
    href: "/resume/Guna_Sekhar_Madireddi_Resume.pdf",
    fileName: "Guna_Sekhar_Madireddi_Resume.pdf",
  },

  /** Public URL used for SEO metadata. Set NEXT_PUBLIC_SITE_URL when deploying. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  description:
    "Guna Sekhar Madireddi — Full-Stack Engineer building scalable backend systems, real-time applications and AI-powered products with Node.js, Go, React, Kafka, Redis and PostgreSQL.",
} as const;

export const mailto = (subject = "Let's build something together") =>
  `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;

export type SectionId = "home" | "about" | "experience" | "projects" | "skills" | "contact";

export const navItems: { id: SectionId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
