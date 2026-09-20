import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Dr. Sayali Sawant, Gynaecologist and IVF Specialist, Goregaon West, Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#fdf3fe",
          color: "#290628",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: "#290628",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -18,
                bottom: 56,
                width: 58,
                height: 58,
                borderRadius: 29,
                background: "#ea7af4",
                opacity: 0.92,
              }}
            />
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: -3,
                marginTop: 3,
              }}
            >
              SS
            </div>
          </div>
          <div style={{ fontSize: 28 }}>Consultant Obstetrician</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
          Dr. Sayali Sawant
        </div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#6200b3" }}>
          Gynaecologist & IVF Specialist
        </div>
        <div
          style={{
            width: 180,
            height: 10,
            marginTop: 28,
            borderRadius: 5,
            background: "#ea7af4",
          }}
        />
        <div style={{ fontSize: 28, marginTop: 28 }}>
          Goregaon West, Mumbai
        </div>
      </div>
    ),
    { ...size },
  );
}
