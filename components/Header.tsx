import { Lock } from "lucide-react";

interface HeaderProps {
  isActive: boolean;
}

export function Header({ isActive }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Lock className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tighter uppercase">
          Lock In
        </h1>
      </div>
      {isActive && (
        <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
          Locked
        </div>
      )}
    </div>
  );
}
