import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f9ff",
          color: "#2b1a36",
          borderBottom: "6px solid #ffafcc",
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
