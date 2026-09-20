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
          background: "#290628",
          borderRadius: 32,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: 38,
            width: 38,
            height: 38,
            borderRadius: 19,
            background: "#ea7af4",
            opacity: 0.92,
          }}
        />
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -2,
            marginTop: 2,
          }}
        >
          SS
        </div>
      </div>
    ),
    { ...size },
  );
}
