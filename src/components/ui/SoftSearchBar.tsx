import { Search } from "lucide-react";

type SoftSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SoftSearchBar({
  value,
  onChange,
  placeholder = "搜索任务、卡片、纪念日...",
  className = "",
}: SoftSearchBarProps) {
  return (
    <label className={`relative block ${className}`}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-16 w-full rounded-full border border-white/80 bg-[#FBFAF7] px-6 pr-16 text-[15px] font-semibold text-[#1f1f1f] shadow-[inset_0_2px_8px_rgba(31,31,31,0.05),0_12px_40px_rgba(30,30,30,0.04)] outline-none transition placeholder:text-[#8b8b86] focus:border-[#A8B8AE] focus:bg-white"
      />
      <span className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#1f1f1f] text-white shadow-sm">
        <Search size={18} />
      </span>
    </label>
  );
}
