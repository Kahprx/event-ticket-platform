import { QRCodeSVG } from "qrcode.react";

export default function QRCodeTicket({ value, size = 116, className = "" }) {
  return (
    <div className={`inline-flex rounded-lg border border-line bg-white p-2 ${className}`}>
      <QRCodeSVG value={value} size={size} level="M" bgColor="#ffffff" fgColor="#101a26" />
    </div>
  );
}
