import { Lock } from "lucide-react";

interface HeaderProps {
  status: 'IDLE' | 'FOCUSING' | 'BREAK';
}

export function Header({ status }: HeaderProps) {
  const isLocked = status === 'FOCUSING';
  const isBreak = status === 'BREAK';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Lock className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tighter uppercase">
          Lock In
        </h1>
      </div>
      {isLocked && (
        <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
          Locked
        </div>
      )}
      {isBreak && (
        <div className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
          On Break
        </div>
      )}
    </div>
  );
}
