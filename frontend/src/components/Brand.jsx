import { Link } from "react-router-dom";
import { AudioLines } from "lucide-react";

export default function Brand({ variant = "dark" }) {
  const textColor = variant === "dark" ? "text-white" : "text-ink-900";
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${textColor}`} aria-label="Soundpass - Trang chủ">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
        <AudioLines size={18} strokeWidth={2.2} />
      </span>
      <span className="font-display text-[19px] font-extrabold tracking-[-0.03em]">
        sound<span className="text-accent">pass</span>
      </span>
    </Link>
  );
}
