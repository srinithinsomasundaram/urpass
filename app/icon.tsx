import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M 5 8 A 4 4 0 0 1 9 4 L 23 4 A 4 4 0 0 1 27 8 A 4 4 0 0 0 27 16 A 4 4 0 0 0 27 24 A 4 4 0 0 1 23 28 L 9 28 A 4 4 0 0 1 5 24 A 4 4 0 0 0 5 16 A 4 4 0 0 0 5 8 Z"
          stroke="#7C3AED"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="16"
          y1="9"
          x2="16"
          y2="23"
          stroke="#7C3AED"
          strokeWidth="3.2"
          strokeDasharray="2.5 3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size }
  );
}

