import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Shuffle } from "lucide-react";

const BG   = "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)";
const BLUE = "#0268CE";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: BG }}
    >
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
          <Shuffle className="h-5 w-5 text-white" />
        </div>
        <span className="text-[18px] font-extrabold tracking-tight text-white">SentConnect</span>
      </div>

      <div
        className="w-full max-w-[420px] bg-white rounded-2xl px-8 py-10 text-center"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#FEF2F2", border: "2px solid #FECACA" }}
        >
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-[14px] text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <button
            className="w-full h-11 text-white font-bold rounded-xl text-[15px] transition-all"
            style={{ background: BLUE }}
            onMouseEnter={e => { e.currentTarget.style.background = "#0155a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
          >
            Back to Home
          </button>
        </Link>
      </div>

      <p className="mt-8 text-white/40 text-[12px]">"Declare his glory among the nations." — Ps 96:3</p>
    </div>
  );
}
