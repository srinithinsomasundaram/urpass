import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #6D28D9, #4c1d95)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "38px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="110"
        height="110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 9a3 3 0 0 1 0-6h20a3 3 0 0 1 0 6v1a3 3 0 0 1 0 6v1a3 3 0 0 1 0 6H2a3 3 0 0 1 0-6v-1a3 3 0 0 1 0-6V9z" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    </div>,
    { ...size }
  );
}
