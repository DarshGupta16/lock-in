"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

export function ReasonModal({ isOpen, onClose, onConfirm, loading }: ReasonModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight uppercase">End Session Early?</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              Mandatory Reason Required
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              Reason
            </label>
            <textarea
              autoFocus
              required
              placeholder="Provide a valid reason for ending early..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-900/30 border border-zinc-800 p-4 text-xs focus:border-zinc-500 transition-colors placeholder:text-zinc-800 resize-none h-24 outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Confirm End
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
