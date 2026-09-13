import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Dr. Sayali Sawant, Gynaecologist and IVF Specialist, Goregaon West, Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "#f2f9ff",
          color: "#2b1a36",
        }}
      >
        <div style={{ fontSize: 28 }}>Consultant Obstetrician</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
          Dr. Sayali Sawant
        </div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#0056a7" }}>
          Gynaecologist & IVF Specialist
        </div>
        <div
          style={{
            width: 180,
            height: 10,
            marginTop: 28,
            borderRadius: 5,
            background: "#ffafcc",
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
