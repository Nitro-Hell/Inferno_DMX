import React, { useEffect } from 'react';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';

interface AccessModalProps {
  status: 'granted' | 'denied' | null;
  onClose: () => void;
}

export const AccessModal: React.FC<AccessModalProps> = ({ status, onClose }) => {
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  if (!status) return null;

  const isGranted = status === 'granted';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs cursor-pointer p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-w-md w-full border-4 p-6 rounded-sm text-center relative shadow-2xl ${
          isGranted
            ? 'border-[#00ff66] bg-[#021808] text-[#00ff66] box-glow-green'
            : 'border-red-500 bg-[#1c0404] text-red-400 box-glow-amber'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          {isGranted ? (
            <ShieldCheck className="w-16 h-16 text-[#00ff66] animate-bounce" />
          ) : (
            <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
          )}
        </div>

        <h2 className="text-3xl font-black tracking-widest uppercase mb-2 font-mono">
          {isGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </h2>

        <div
          className={`h-0.5 w-full my-3 ${
            isGranted ? 'bg-[#00ff66]' : 'bg-red-500'
          }`}
        />

        <p className="text-xs font-mono uppercase tracking-wider text-neutral-300">
          {isGranted
            ? 'Cryptographic clearance level 5 authenticated. Root privileges elevated.'
            : 'Security breach detected. Host IP flagged and traffic routed to sandbox honeypot.'}
        </p>

        <div className="mt-4 text-[11px] text-neutral-500 font-mono">
          Click anywhere or press [ESC] to dismiss
        </div>
      </div>
    </div>
  );
};
