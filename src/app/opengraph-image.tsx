import { ImageResponse } from "next/og";

export const alt = "Yojak — Compliance, Connected.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={{ fontSize: 48, fontWeight: 700, color: "white" }}>
            Yojak
          </span>
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Automated DPDP Act 2023 Compliance
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          {["Consent Management", "Data Mapping", "Grievance Redressal", "22 Languages"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: "1px solid #334155",
                  color: "#a5b4fc",
                  fontSize: 16,
                }}
              >
                {feature}
              </div>
            ),
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "#64748b",
          }}
        >
          Privacy-as-a-Service for Indian Businesses — Starting at Rs 999/month
        </div>
      </div>
    ),
    { ...size },
  );
}
