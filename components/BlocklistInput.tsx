import { X, Plus } from "lucide-react";
import { useState } from "react";

interface BlocklistInputProps {
  blocklist: string[];
  onAddDomain: (domain: string) => void;
  onRemoveDomain: (domain: string) => void;
  onEnterPressed?: () => void;
}

export function BlocklistInput({
  blocklist,
  onAddDomain,
  onRemoveDomain,
  onEnterPressed,
}: BlocklistInputProps) {
  const [newDomain, setNewDomain] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (newDomain.trim()) {
        onAddDomain(newDomain.trim());
        setNewDomain("");
      } else if (onEnterPressed) {
        onEnterPressed();
      }
    }
  };

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      onAddDomain(newDomain.trim());
      setNewDomain("");
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
        Restrictions
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {blocklist.map((domain) => (
          <span
            key={domain}
            className="group flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            {domain}
            <button
              onClick={() => onRemoveDomain(domain)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative group">
        <input
          type="text"
          placeholder="Add domain to block..."
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-b border-zinc-900 py-2 text-sm focus:border-zinc-500 transition-colors placeholder:text-zinc-800"
        />
        <button
          onClick={handleAddDomain}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-2"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
