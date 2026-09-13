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
          background: "#0E7490",
          color: "#F8FAFC",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9 }}>Consultant Obstetrician</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
          Dr. Sayali Sawant
        </div>
        <div style={{ fontSize: 32, marginTop: 16 }}>
          Gynaecologist & IVF Specialist
        </div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#E0F2F7" }}>
          Goregaon West, Mumbai
        </div>
      </div>
    ),
    { ...size },
  );
}
