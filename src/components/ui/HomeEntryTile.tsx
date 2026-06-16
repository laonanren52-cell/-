import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DotPattern } from "./DotPattern";

type HomeEntryTileProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  to: string;
  className?: string;
};

export function HomeEntryTile({ title, subtitle, icon: Icon, to, className = "" }: HomeEntryTileProps) {
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[220px] overflow-hidden rounded-[32px] border border-[#E8E2D8] bg-[#FBFAF7] p-8 shadow-[0_18px_50px_rgba(31,41,55,0.06)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_60px_rgba(31,41,55,0.10)] active:scale-[0.99] md:min-h-[240px] ${className}`}
    >
      <DotPattern opacity={0.16} />
      <div className="relative z-10 flex w-full flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-5">
          {Icon ? (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#25324A] shadow-sm">
              <Icon size={24} />
            </span>
          ) : (
            <span className="h-14 w-14 shrink-0" />
          )}
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25324A] text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="mt-10">
          <h3 className="text-3xl font-bold tracking-tight text-[#1F1F1F]">{title}</h3>
          {subtitle ? <p className="mt-3 max-w-[260px] text-base leading-7 text-[#5F6368]">{subtitle}</p> : null}
        </div>
      </div>
    </Link>
  );
}
