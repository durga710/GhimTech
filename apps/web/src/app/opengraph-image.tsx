import { ImageResponse } from "next/og";
export const alt = "GhimTech. We build the systems behind the business.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f5f3ed",
        color: "#202722",
        width: "100%",
        height: "100%",
        padding: 70,
      }}
    >
      <div style={{ display: "flex", fontSize: 34 }}>GhimTech.</div>
      <div
        style={{
          display: "flex",
          fontSize: 78,
          letterSpacing: -4,
          maxWidth: 1000,
          lineHeight: 1.05,
        }}
      >
        We build the systems behind the business.
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#a34228" }}>
        BUSINESS SOFTWARE / OPERATIONAL SYSTEMS
      </div>
    </div>,
    size,
  );
}
