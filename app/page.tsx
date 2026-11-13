import { About } from "@/components/about/About";
import { Contact } from "@/components/contact/Contact";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/layout/Marquee";
import { Philosophy } from "@/components/philosophy/Philosophy";
import { Projects } from "@/components/projects/Projects";
import { Skills } from "@/components/skills/Skills";
import { siteConfig } from "@/config/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.title,
  email: `mailto:${siteConfig.email}`,
  url: siteConfig.siteUrl,
  image: `${siteConfig.siteUrl}${siteConfig.photo.src}`,
  sameAs: [siteConfig.github.url, ...(siteConfig.linkedin.isProfileUrl ? [siteConfig.linkedin.url] : [])],
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  worksFor: { "@type": "Organization", name: siteConfig.currentRole.company },
  knowsAbout: ["Node.js", "Go", "React", "Next.js", "Kafka", "Redis", "PostgreSQL", "PostGIS", "Microservices", "System Design"],
};

export default function Home() {
  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Hero />
      <Marquee />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Philosophy />
      <Contact />
    </main>
  );
}
