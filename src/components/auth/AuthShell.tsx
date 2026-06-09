"use client";
import Image from "next/image";

interface AuthShellProps {
  children: React.ReactNode;
}


export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="w-full max-w-[900px] bg-white rounded-[20px] overflow-hidden grid grid-cols-2 min-h-[580px] shadow-modal">
      {/* Left panel */}
      <div className="bg-sidebar relative flex flex-col p-11 overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute w-96 h-96 rounded-full border border-white/[0.03] -bottom-36 -right-36" />
        <div className="absolute w-44 h-44 rounded-full border border-white/[0.03] -top-14 -left-14" />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-start gap-2.5 mb-auto">
          <Image
            src="https://raw.githubusercontent.com/Aileeeeee/safe_pulse/main/public/safepulse-icon.png"
            alt="SAFEPULSE"
            width={64}
            height={64}
            unoptimized
            className="object-contain"
          />
          <div className="text-[22px] font-bold text-white tracking-wide">
            SAFE<span className="text-white/40 font-normal">PULSE</span>
          </div>
          <div className="text-[10px] tracking-[2.5px] text-white/25 uppercase -mt-1.5">
            Report · Illuminate · Act
          </div>
        </div>

        {/* Tagline + features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
          <h2 className="text-[25px] font-semibold text-white leading-[1.35] tracking-tight mb-3">
            Real-time response,{" "}
            <em className="not-italic text-white/40">every second counts.</em>
          </h2>
          <ul className="flex flex-col gap-2.5 mt-1">
            
          </ul>
        </div>

        {/* Trust bar */}
        <div className="relative z-10 flex items-center gap-2 pt-5 border-t border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[11px] text-white/28 leading-relaxed">
            End-to-end encrypted · NDPR compliant · ISO aligned
          </span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center px-11 py-11 bg-white">
        {children}
      </div>
    </div>
  );
}
