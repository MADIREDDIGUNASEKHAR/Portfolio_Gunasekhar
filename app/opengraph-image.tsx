import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — Full-Stack Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0b0a",
          color: "#eceee8",
          fontFamily: "sans-serif",
          backgroundImage:
            "radial-gradient(circle at 85% 30%, rgba(197,242,74,0.22), transparent 45%), linear-gradient(rgba(236,238,232,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(236,238,232,0.06) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 72px 72px, 72px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 17,
              background: "#c5f24a",
              color: "#0a0b0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            GS
          </div>
          <div style={{ fontSize: 26, color: "#9ba098" }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, letterSpacing: -3, lineHeight: 1 }}>Building Systems.</div>
          <div style={{ fontSize: 84, letterSpacing: -3, lineHeight: 1.05, display: "flex" }}>
            Engineering&nbsp;<span style={{ color: "#c5f24a", fontStyle: "italic" }}>Possibilities.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 24, color: "#9ba098" }}>
          <span>Full-Stack Engineer</span>
          <span>·</span>
          <span>Node.js · Go · React · Kafka · Redis</span>
          <span>·</span>
          <span>India</span>
        </div>
      </div>
    ),
    size,
  );
}
