# Guna Sekhar Madireddi — Portfolio

Personal portfolio for a full-stack engineer. Next.js 16 (App Router, statically prerendered), TypeScript, Tailwind CSS v4, React Three Fiber, GSAP ScrollTrigger, Motion and Lenis.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages prerendered)
npm start          # serve the production build
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.com`) when deploying so canonical URLs, Open Graph, `sitemap.xml` and `robots.txt` point at the right host.

## Page-view counter

The footer shows total portfolio views, today's views, and a 14-day trend. Data comes from `GET/POST /api/views` (`app/api/views/route.ts`, storage in `lib/views-store.ts`).

- **How views are counted:** one view per browser session, so refreshes and moving between pages don't add more. Common bots and crawlers are ignored. Only totals are stored: no IP addresses, cookies or personal data.
- **Local / `next start` on your machine:** counts are saved in `.data/views.json`, which is gitignored. Delete that file to reset.
- **Production (Vercel):** serverless hosts have no permanent disk, so connect a free **Upstash Redis** database: Vercel project → **Storage** → **Upstash for Redis** → connect, then redeploy. Its environment variables (`KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) are picked up automatically. Until a database is connected, the counter stays hidden instead of showing numbers that reset.

## Editing content

All copy lives outside the UI, so you rarely need to touch components:

| What | File |
| --- | --- |
| Name, email, phone, GitHub, **LinkedIn**, resume path, location | `config/site.ts` |
| Work experience, metrics, engineering breakdowns, education | `data/experience.ts` |
| Projects — summary, highlights, architecture diagram, decisions, challenges, code sketches | `data/projects.ts` |
| Skills, the "where I used it" context, and constellation links | `data/skills.ts` |
| About interests, stats, engineering-philosophy steps | `data/about.ts` |
| Resume PDF | `public/resume/Guna_Sekhar_Madireddi_Resume.pdf` |

**LinkedIn:** set `siteConfig.linkedin.url` to your profile URL and `isProfileUrl: true`. Until then the link opens a LinkedIn people search for your name.

Adding a project to `data/projects.ts` automatically creates its `/work/<slug>` case-study page, adds it to the sitemap, and renders its architecture diagram from the `nodes`/`edges` you define. The `visual` field picks one of the four live visualizations in `components/projects/visuals/`.

## Structure

```
app/                 routes: home, /work/[slug] case studies, OG image, sitemap, robots, 404
components/
  layout/            providers (Lenis + GSAP sync), footer, marquee
  navigation/        floating nav, theme toggle
  hero/              hero, rotating text, lazy 3D loader
  three/             R3F systems scene + static SVG fallback
  about/ experience/ projects/ skills/ philosophy/ contact/
  ui/                buttons, magnetic, reveal, tilt card, icons
config/ data/        all content
hooks/ lib/          media queries, in-view, loop clock, theme store, scroll, gsap
```

## Performance and accessibility notes

- The WebGL scene is code-split and mounted only after the browser is idle. It cross-fades from a static SVG, renders only while visible, adapts DPR under load, and uses fewer nodes, packets and particles on mobile. Without WebGL, or if the renderer fails, the SVG stays in place.
- Every canvas and SVG animation pauses offscreen. With `prefers-reduced-motion`, smooth scrolling, the pinned horizontal sequence and looping simulations are turned off and the layouts switch to static equivalents.
- The theme is applied by an inline script before first paint (no flash), saved in `localStorage`, and switched with a View Transitions circular reveal where supported.
