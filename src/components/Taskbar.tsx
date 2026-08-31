import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Tv,
  LayoutGrid,
  Maximize,
  Minimize,
  Terminal,
  Cpu,
  KeyRound,
  Coins,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WindowId, WindowState } from '../types';
import { cyberAudio } from '../utils/audio';

interface TaskbarProps {
  windows: Record<WindowId, WindowState>;
  activeWindowId: WindowId | null;
  onSelectWindow: (id: WindowId) => void;
  onTileAll: () => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenWindow: (id: WindowId) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onSelectWindow,
  onTileAll,
  isCrtEnabled,
  onToggleCrt,
  isMuted,
  onToggleMute,
  onOpenWindow,
}) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Live digital clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeString(
        `${d.getHours().toString().padStart(2, '0')}:${d
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) {
        setIsStartOpen(false);
      }
    };
    if (isStartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStartOpen]);

  const toggleFullscreen = () => {
    cyberAudio.playKeyClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleStartToggle = () => {
    cyberAudio.playKeyClick();
    setIsStartOpen(!isStartOpen);
  };

  const menuItems = [
    {
      id: 'cracker' as WindowId,
      title: 'Brute-Force & Password Cracker',
      subtitle: 'SHA-512 Hash Analysis & Recovery',
      icon: <KeyRound className="w-4 h-4 text-[#00ff66]" />,
    },
    {
      id: 'miner' as WindowId,
      title: 'Proof-of-Work Bitcoin Miner',
      subtitle: 'Stratum Protocol & Hash Solver',
      icon: <Coins className="w-4 h-4 text-[#00ff66]" />,
    },
    {
      id: 'compiler' as WindowId,
      title: 'Automated Kernel Compiler',
      subtitle: 'Stream Analyzer & Telemetry Engine',
      icon: <Cpu className="w-4 h-4 text-[#00ff66]" />,
    },
    {
      id: 'typer' as WindowId,
      title: 'Interactive Code Typer',
      subtitle: 'Keypress Terminal & Script Emulator',
      icon: <Terminal className="w-4 h-4 text-[#00ff66]" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#020e05] border-t-2 border-[#00ff66] z-40 flex items-center justify-between px-2 text-xs font-mono select-none">
      {/* Left: Start Button & Active Tasks */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[70vw]">
        {/* Start / System Button */}
        <div className="relative" ref={startMenuRef}>
          <button
            onClick={handleStartToggle}
            className={`px-3 py-1.5 border font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-xs cursor-pointer ${
              isStartOpen
                ? 'border-[#00ff66] bg-[#00ff66] text-black glow-green'
                : 'border-[#00ff66] bg-[#01240c] text-[#00ff66] hover:bg-[#00ff66]/20'
            }`}
          >
            <Shield className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono font-black">SYSTEM</span>
          </button>

          {/* Start Menu Popup */}
          {isStartOpen && (
            <div className="absolute bottom-12 left-0 w-72 bg-[#021307]/95 border-2 border-[#00ff66] p-2 rounded-t-sm shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="border-b border-[#00ff66]/30 pb-2 mb-2 px-1">
                <div className="text-xs font-bold text-[#00ff66] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  CYBER SIMULATION SUITE
                </div>
                <div className="text-[10px] text-neutral-400">Security Testing Workstation v4.2</div>
              </div>

              {/* Module List */}
              <div className="space-y-1 mb-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onOpenWindow(item.id);
                      setIsStartOpen(false);
                      cyberAudio.playKeyClick();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#00ff66]/20 text-left transition-colors border border-transparent hover:border-[#00ff66]/40 cursor-pointer"
                  >
                    <div className="p-1 border border-[#00ff66]/40 bg-black/40 rounded">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-[#00ff66] font-bold">{item.title}</div>
                      <div className="text-[9px] text-neutral-400">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Actions inside start menu */}
              <div className="border-t border-[#00ff66]/30 pt-2 space-y-1">
                <button
                  onClick={() => {
                    onTileAll();
                    setIsStartOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-[#00ff66] hover:bg-[#00ff66]/20 rounded flex items-center gap-2 cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Tile All 4 Modules (SOC Mode)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tile Button on Taskbar */}
        <button
          onClick={() => {
            cyberAudio.playKeyClick();
            onTileAll();
          }}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 border border-[#00ff66]/40 bg-[#011a09] hover:bg-[#00ff66]/20 text-[#00ff66] text-xs font-bold rounded-xs cursor-pointer"
          title="Tile all 4 modules side-by-side"
        >
          <LayoutGrid className="w-3 h-3" />
          <span className="hidden md:inline">Tile 4 Windows</span>
        </button>

        {/* Active Window Tabs */}
        {(Object.values(windows) as WindowState[]).map((win) => {
          if (!win.isOpen) return null;
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => onSelectWindow(win.id)}
              className={`px-2.5 py-1 border text-xs truncate max-w-[140px] sm:max-w-[180px] transition-all flex items-center gap-1.5 rounded-xs cursor-pointer ${
                isActive
                  ? 'border-[#00ff66] bg-[#00ff66] text-black font-bold'
                  : 'border-[#00ff66]/40 bg-[#011a09] text-[#00ff66] hover:bg-[#00ff66]/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="truncate">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Settings & System Clock */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-1.5 border transition-colors rounded-xs cursor-pointer ${
            isMuted
              ? 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
              : 'border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66] hover:bg-[#00ff66]/20'
          }`}
          title={isMuted ? 'Unmute Cyber Audio' : 'Mute Audio FX'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={onToggleCrt}
          className={`p-1.5 border transition-colors rounded-xs cursor-pointer ${
            isCrtEnabled
              ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66]'
              : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
          }`}
          title="Toggle CRT Scanline Shader"
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-1.5 border border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66]/20 rounded-xs cursor-pointer"
          title="Fullscreen Mode"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* System Time */}
        <div className="flex items-center gap-1 px-2 py-1 border border-[#00ff66]/40 bg-[#011408] text-[#00ff66] rounded-xs font-bold text-[11px] sm:text-xs">
          <Clock className="w-3 h-3 text-[#00ff66]/70" />
          <span>{timeString}</span>
        </div>
      </div>
    </div>
  );
};
