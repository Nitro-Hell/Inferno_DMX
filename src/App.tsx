import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Coins,
  Cpu,
  Terminal,
  LayoutGrid,
  ShieldCheck,
  Maximize2,
  Tv,
  Volume2,
  VolumeX,
  Sparkles,
  Code2,
  Activity,
  Layers,
} from 'lucide-react';
import { WindowId, WindowState } from './types';
import { WindowFrame } from './components/WindowFrame';
import { PasswordCracker } from './components/PasswordCracker';
import { BitcoinMiningSimulator } from './components/BitcoinMiningSimulator';
import { AutoCodeGenerator } from './components/AutoCodeGenerator';
import { CodeExecutionSandbox } from './components/CodeExecutionSandbox';
import { CompilerStream } from './components/CompilerStream';
import { InteractiveTyper } from './components/InteractiveTyper';
import { DesktopIcon } from './components/DesktopIcon';
import { Taskbar } from './components/Taskbar';
import { BackgroundEffect } from './components/BackgroundEffect';
import { AccessModal } from './components/AccessModal';
import { cyberAudio } from './utils/audio';

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  cracker: {
    id: 'cracker',
    title: 'Authentication & Hash Collision Analyzer',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 15, y: 15 },
    size: { width: 560, height: 460 },
  },
  miner: {
    id: 'miner',
    title: 'Bitcoin Proof-of-Work & DLT Mining Simulator',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 11,
    position: { x: 590, y: 15 },
    size: { width: 560, height: 460 },
  },
  generator: {
    id: 'generator',
    title: 'Automatic Code Synthesis & Architecture Generator',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 12,
    position: { x: 15, y: 490 },
    size: { width: 560, height: 460 },
  },
  executor: {
    id: 'executor',
    title: 'On-Demand Sandboxed Code Execution Engine',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 13,
    position: { x: 590, y: 490 },
    size: { width: 560, height: 460 },
  },
  ledger: {
    id: 'ledger',
    title: 'Interactive Code Emulator & Typer',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 9,
    position: { x: 100, y: 100 },
    size: { width: 520, height: 420 },
  },
  system: {
    id: 'system',
    title: 'DMA Stream & Kernel Compiler',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 8,
    position: { x: 120, y: 120 },
    size: { width: 520, height: 420 },
  },
};

export default function App() {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>('cracker');
  const [highestZIndex, setHighestZIndex] = useState(15);
  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [accessModalStatus, setAccessModalStatus] = useState<'granted' | 'denied' | null>(null);

  // Sub-view toggles for windows
  const [generatorMode, setGeneratorMode] = useState<'ai' | 'stream'>('ai');
  const [executorMode, setExecutorMode] = useState<'sandbox' | 'typer'>('sandbox');

  // Bring a window to front
  const focusWindow = useCallback((id: WindowId) => {
    setHighestZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((wins) => {
        if (!wins[id]) return wins;
        return {
          ...wins,
          [id]: {
            ...wins[id],
            isOpen: true,
            isMinimized: false,
            zIndex: nextZ,
          },
        };
      });
      return nextZ;
    });
    setActiveWindowId(id);
  }, []);

  const openWindow = (id: WindowId) => {
    focusWindow(id);
  };

  const closeWindow = (id: WindowId) => {
    cyberAudio.playKeyClick();
    setWindows((wins) => ({
      ...wins,
      [id]: { ...wins[id], isOpen: false },
    }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: WindowId) => {
    cyberAudio.playKeyClick();
    setWindows((wins) => ({
      ...wins,
      [id]: { ...wins[id], isMinimized: true },
    }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeWindow = (id: WindowId) => {
    cyberAudio.playKeyClick();
    setWindows((wins) => ({
      ...wins,
      [id]: { ...wins[id], isMaximized: !wins[id].isMaximized },
    }));
  };

  const updateWindowPosition = (id: WindowId, pos: { x: number; y: number }) => {
    setWindows((wins) => ({
      ...wins,
      [id]: { ...wins[id], position: pos },
    }));
  };

  // Tile all 4 requested core modules evenly in a 2x2 grid layout
  const tileAll4Windows = useCallback(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 56; // account for taskbar

    const isSmall = screenW < 860;

    if (isSmall) {
      // Stack windows on small screens
      setWindows((wins) => ({
        ...wins,
        cracker: {
          ...wins.cracker,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: 8 },
          size: { width: screenW - 16, height: 420 },
          zIndex: 10,
        },
        miner: {
          ...wins.miner,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: 436 },
          size: { width: screenW - 16, height: 420 },
          zIndex: 11,
        },
        generator: {
          ...wins.generator,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: 864 },
          size: { width: screenW - 16, height: 420 },
          zIndex: 12,
        },
        executor: {
          ...wins.executor,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: 1292 },
          size: { width: screenW - 16, height: 420 },
          zIndex: 13,
        },
      }));
    } else {
      // 2x2 Grid for Desktop / Tablet
      const halfW = Math.floor(screenW / 2) - 14;
      const halfH = Math.floor(screenH / 2) - 14;

      setWindows((wins) => ({
        ...wins,
        cracker: {
          ...wins.cracker,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: 8 },
          size: { width: halfW, height: halfH },
          zIndex: 10,
        },
        miner: {
          ...wins.miner,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: halfW + 16, y: 8 },
          size: { width: halfW, height: halfH },
          zIndex: 11,
        },
        generator: {
          ...wins.generator,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 8, y: halfH + 16 },
          size: { width: halfW, height: halfH },
          zIndex: 12,
        },
        executor: {
          ...wins.executor,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: halfW + 16, y: halfH + 16 },
          size: { width: halfW, height: halfH },
          zIndex: 13,
        },
      }));
    }
    setActiveWindowId('cracker');
  }, []);

  // Initial responsive setup
  useEffect(() => {
    tileAll4Windows();
  }, [tileAll4Windows]);

  const handleToggleMute = () => {
    const next = cyberAudio.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative w-screen h-screen bg-[#020804] text-[#00ff66] overflow-hidden select-none font-mono">
      {/* Background Matrix/Radar Effect */}
      <BackgroundEffect mode="matrix" />

      {/* CRT Scanline Shader Overlay */}
      {isCrtEnabled && <div className="crt-overlay fixed inset-0 z-30 pointer-events-none" />}

      {/* Desktop Quick Shortcuts */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <DesktopIcon
          id="icon-cracker"
          title="Hash Collisions"
          subtitle="Password Cracker"
          icon={<KeyRound className="w-6 h-6 text-[#00ff66]" />}
          isOpen={windows.cracker?.isOpen && !windows.cracker?.isMinimized}
          onClick={() => focusWindow('cracker')}
        />

        <DesktopIcon
          id="icon-miner"
          title="Bitcoin Mining"
          subtitle="SHA-256 Node"
          icon={<Coins className="w-6 h-6 text-[#00ff66]" />}
          isOpen={windows.miner?.isOpen && !windows.miner?.isMinimized}
          onClick={() => focusWindow('miner')}
        />

        <DesktopIcon
          id="icon-generator"
          title="Auto Code Gen"
          subtitle="Synthesis Stream"
          icon={<Sparkles className="w-6 h-6 text-[#d48aff]" />}
          isOpen={windows.generator?.isOpen && !windows.generator?.isMinimized}
          onClick={() => focusWindow('generator')}
        />

        <DesktopIcon
          id="icon-executor"
          title="Code Sandbox"
          subtitle="On-Demand Exec"
          icon={<Terminal className="w-6 h-6 text-[#00e5ff]" />}
          isOpen={windows.executor?.isOpen && !windows.executor?.isMinimized}
          onClick={() => focusWindow('executor')}
        />
      </div>

      {/* Top Floating Action Bar */}
      <div className="absolute top-3 right-4 z-20 hidden md:flex items-center gap-2 bg-[#011407]/90 backdrop-blur-xs border border-[#00ff66]/30 px-3 py-1.5 rounded-sm text-xs">
        <button
          onClick={tileAll4Windows}
          className="flex items-center gap-1.5 text-[#00ff66] hover:text-white px-2 py-1 rounded hover:bg-[#00ff66]/20 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Tile 4 Modules</span>
        </button>

        <div className="w-px h-4 bg-[#00ff66]/30 mx-1" />

        <button
          onClick={() => setAccessModalStatus('granted')}
          className="flex items-center gap-1 text-[#00ff66] hover:bg-[#00ff66]/20 px-2 py-1 rounded transition-colors cursor-pointer"
          title="Test Access Granted Banner"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Grant Key</span>
        </button>
      </div>

      {/* Windows Workspace Canvas */}
      <div className="relative w-full h-full pb-12 overflow-hidden">
        {/* Module 1: Password Cracker / Authentication Resilience */}
        {windows.cracker?.isOpen && (
          <WindowFrame
            windowState={windows.cracker}
            isActive={activeWindowId === 'cracker'}
            onFocus={() => focusWindow('cracker')}
            onClose={() => closeWindow('cracker')}
            onMinimize={() => minimizeWindow('cracker')}
            onToggleMaximize={() => toggleMaximizeWindow('cracker')}
            onUpdatePosition={(pos) => updateWindowPosition('cracker', pos)}
            icon={<KeyRound className="w-3.5 h-3.5 text-[#00ff66]" />}
          >
            <PasswordCracker />
          </WindowFrame>
        )}

        {/* Module 2: Bitcoin Proof-of-Work Mining Simulator */}
        {windows.miner?.isOpen && (
          <WindowFrame
            windowState={windows.miner}
            isActive={activeWindowId === 'miner'}
            onFocus={() => focusWindow('miner')}
            onClose={() => closeWindow('miner')}
            onMinimize={() => minimizeWindow('miner')}
            onToggleMaximize={() => toggleMaximizeWindow('miner')}
            onUpdatePosition={(pos) => updateWindowPosition('miner', pos)}
            icon={<Coins className="w-3.5 h-3.5 text-[#00ff66]" />}
          >
            <BitcoinMiningSimulator />
          </WindowFrame>
        )}

        {/* Module 3: Automatic Code Generation / Synthesis */}
        {windows.generator?.isOpen && (
          <WindowFrame
            windowState={windows.generator}
            isActive={activeWindowId === 'generator'}
            onFocus={() => focusWindow('generator')}
            onClose={() => closeWindow('generator')}
            onMinimize={() => minimizeWindow('generator')}
            onToggleMaximize={() => toggleMaximizeWindow('generator')}
            onUpdatePosition={(pos) => updateWindowPosition('generator', pos)}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#d48aff]" />}
          >
            {generatorMode === 'ai' ? (
              <AutoCodeGenerator />
            ) : (
              <CompilerStream />
            )}
          </WindowFrame>
        )}

        {/* Module 4: On-Demand Sandboxed Code Execution */}
        {windows.executor?.isOpen && (
          <WindowFrame
            windowState={windows.executor}
            isActive={activeWindowId === 'executor'}
            onFocus={() => focusWindow('executor')}
            onClose={() => closeWindow('executor')}
            onMinimize={() => minimizeWindow('executor')}
            onToggleMaximize={() => toggleMaximizeWindow('executor')}
            onUpdatePosition={(pos) => updateWindowPosition('executor', pos)}
            icon={<Terminal className="w-3.5 h-3.5 text-[#00e5ff]" />}
          >
            {executorMode === 'sandbox' ? (
              <CodeExecutionSandbox />
            ) : (
              <InteractiveTyper onTriggerAccess={(status) => setAccessModalStatus(status)} />
            )}
          </WindowFrame>
        )}

        {/* Optional Secondary Windows */}
        {windows.ledger?.isOpen && (
          <WindowFrame
            windowState={windows.ledger}
            isActive={activeWindowId === 'ledger'}
            onFocus={() => focusWindow('ledger')}
            onClose={() => closeWindow('ledger')}
            onMinimize={() => minimizeWindow('ledger')}
            onToggleMaximize={() => toggleMaximizeWindow('ledger')}
            onUpdatePosition={(pos) => updateWindowPosition('ledger', pos)}
            icon={<Terminal className="w-3.5 h-3.5" />}
          >
            <InteractiveTyper onTriggerAccess={(status) => setAccessModalStatus(status)} />
          </WindowFrame>
        )}

        {windows.system?.isOpen && (
          <WindowFrame
            windowState={windows.system}
            isActive={activeWindowId === 'system'}
            onFocus={() => focusWindow('system')}
            onClose={() => closeWindow('system')}
            onMinimize={() => minimizeWindow('system')}
            onToggleMaximize={() => toggleMaximizeWindow('system')}
            onUpdatePosition={(pos) => updateWindowPosition('system', pos)}
            icon={<Cpu className="w-3.5 h-3.5" />}
          >
            <CompilerStream />
          </WindowFrame>
        )}
      </div>

      {/* Access Granted / Denied Modal Trigger Overlay */}
      <AccessModal status={accessModalStatus} onClose={() => setAccessModalStatus(null)} />

      {/* Bottom Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={(id) => focusWindow(id)}
        onTileAll={tileAll4Windows}
        isCrtEnabled={isCrtEnabled}
        onToggleCrt={() => setIsCrtEnabled(!isCrtEnabled)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenWindow={openWindow}
      />
    </div>
  );
}
