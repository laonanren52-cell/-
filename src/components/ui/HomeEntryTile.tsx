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
      className={`group relative min-h-[156px] overflow-hidden rounded-[32px] border border-white/80 bg-[#FBFAF7] p-5 shadow-[0_12px_40px_rgba(30,30,30,0.06)] transition duration-300 hover:-translate-y-1 hover:bg-white active:scale-[0.99] ${className}`}
    >
      <DotPattern opacity={0.28} />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          {Icon ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1f1f1f] shadow-[inset_0_1px_6px_rgba(31,31,31,0.05)]">
              <Icon size={20} />
            </span>
          ) : <span />}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25324A] text-white transition duration-300 group-hover:rotate-45">
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-normal text-[#1f1f1f]">{title}</h3>
          {subtitle ? <p className="mt-2 max-w-[13rem] text-sm font-medium leading-6 text-[#626262]">{subtitle}</p> : null}
        </div>
      </div>
    </Link>
  );
}
