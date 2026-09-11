import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#202722",
        color: "#f5f3ed",
        fontSize: 125,
        width: "100%",
        height: "100%",
      }}
    >
      G
    </div>,
    size,
  );
}
