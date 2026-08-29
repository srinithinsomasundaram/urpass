"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
  size?: number;
}

export default function PassQR({ value, size = 180 }: Props) {
  return (
    <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-neutral-100">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#0a0a0a"
        style={{ display: "block" }}
      />
    </div>
  );
}
