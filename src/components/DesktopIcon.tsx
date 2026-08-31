import React from 'react';
import { cyberAudio } from '../utils/audio';

interface DesktopIconProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  accent?: string;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  title,
  subtitle,
  icon,
  isOpen,
  onClick,
  accent = '#00ff66',
}) => {
  const handleClick = () => {
    cyberAudio.playKeyClick();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex flex-col items-center justify-center p-2.5 rounded border transition-all duration-150 w-24 sm:w-28 text-center cursor-pointer select-none ${
        isOpen
          ? 'border-[#00ff66]/60 bg-[#00ff66]/10 text-[#00ff66] box-glow-green'
          : 'border-transparent hover:border-[#00ff66]/40 hover:bg-[#00ff66]/5 text-neutral-300'
      }`}
    >
      {/* Icon frame with retro phosphor styling */}
      <div
        className={`w-12 h-12 flex items-center justify-center border-2 rounded transition-transform group-hover:scale-105 ${
          isOpen
            ? 'border-[#00ff66] bg-[#021f0b] text-[#00ff66]'
            : 'border-[#00ff66]/50 bg-[#011407]/80 text-[#00ff66]/90 group-hover:border-[#00ff66]'
        }`}
      >
        {icon}
      </div>

      {/* Label */}
      <div className="mt-1.5 text-xs font-mono font-bold tracking-tight text-[#00ff66] group-hover:glow-green line-clamp-2">
        {title}
      </div>
      {subtitle && (
        <div className="text-[9px] text-neutral-400 font-mono tracking-tighter">
          {subtitle}
        </div>
      )}
    </button>
  );
};
