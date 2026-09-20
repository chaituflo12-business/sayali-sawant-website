import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#290628",
          borderRadius: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -34,
            bottom: 106,
            width: 108,
            height: 108,
            borderRadius: 54,
            background: "#ea7af4",
            opacity: 0.92,
          }}
        />
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -6,
            marginTop: 6,
          }}
        >
          SS
        </div>
      </div>
    ),
    { ...size },
  );
}
