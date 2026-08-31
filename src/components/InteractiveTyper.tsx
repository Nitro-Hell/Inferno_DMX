import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, ShieldCheck, Terminal, Keyboard, FileCode } from 'lucide-react';
import { CODE_SNIPPETS } from '../data/codeSnippets';
import { cyberAudio } from '../utils/audio';

interface InteractiveTyperProps {
  onTriggerAccess: (status: 'granted' | 'denied') => void;
}

export const InteractiveTyper: React.FC<InteractiveTyperProps> = ({ onTriggerAccess }) => {
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [keystrokes, setKeystrokes] = useState(0);
  const [speedPerKey, setSpeedPerKey] = useState(4); // characters per keypress

  const containerRef = useRef<HTMLDivElement>(null);
  const autoTypeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSnippet = CODE_SNIPPETS[selectedSnippetIdx];
  const fullCode = currentSnippet.code;
  const currentCode = fullCode.substring(0, charIndex);

  // Auto-scroll when code expands
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentCode]);

  // Global keydown listener for "Hacker Typer" feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if focus is in an input or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Hotkey triggers
      if (e.key === 'Tab') {
        e.preventDefault();
        onTriggerAccess('granted');
        cyberAudio.playAccessGranted();
        return;
      }
      if (e.key === 'Escape') {
        onTriggerAccess('denied');
        cyberAudio.playAccessDenied();
        return;
      }

      // Advance code on any key press
      cyberAudio.playKeyClick();
      setKeystrokes((k) => k + 1);
      setCharIndex((idx) => {
        const next = idx + speedPerKey;
        if (next >= fullCode.length) {
          // Loop or cap
          return fullCode.length;
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullCode, speedPerKey, onTriggerAccess]);

  // Auto-type loop
  useEffect(() => {
    if (!isAutoTyping) {
      if (autoTypeTimerRef.current) clearInterval(autoTypeTimerRef.current);
      return;
    }

    autoTypeTimerRef.current = setInterval(() => {
      cyberAudio.playKeyClick();
      setKeystrokes((k) => k + 1);
      setCharIndex((idx) => {
        const next = idx + speedPerKey;
        if (next >= fullCode.length) {
          setIsAutoTyping(false);
          return fullCode.length;
        }
        return next;
      });
    }, 60);

    return () => {
      if (autoTypeTimerRef.current) clearInterval(autoTypeTimerRef.current);
    };
  }, [isAutoTyping, fullCode, speedPerKey]);

  const handleReset = () => {
    setCharIndex(0);
    setKeystrokes(0);
    setIsAutoTyping(false);
    cyberAudio.playKeyClick();
  };

  const handleSnippetChange = (idx: number) => {
    setSelectedSnippetIdx(idx);
    setCharIndex(0);
    cyberAudio.playKeyClick();
  };

  return (
    <div className="flex flex-col h-full bg-[#030d06] text-[#00ff66] font-mono text-sm select-none p-3 overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00ff66]/30 pb-2.5 mb-2">
        <div className="flex items-center gap-2">
          <button
            id="typer-autotype-btn"
            onClick={() => setIsAutoTyping(!isAutoTyping)}
            className={`px-3 py-1 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 rounded-sm cursor-pointer ${
              isAutoTyping
                ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                : 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/40'
            }`}
          >
            {isAutoTyping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            {isAutoTyping ? 'Stop Auto-Type' : 'Auto-Type'}
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1 border border-neutral-700 hover:border-red-400 text-neutral-300 text-xs flex items-center gap-1 rounded-sm cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Access trigger buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onTriggerAccess('granted');
              cyberAudio.playAccessGranted();
            }}
            className="px-2 py-1 border border-[#00ff66]/60 bg-[#00ff66]/15 hover:bg-[#00ff66]/30 text-[#00ff66] text-xs font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer"
            title="Press TAB on keyboard"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Access</span> Granted
          </button>

          <button
            onClick={() => {
              onTriggerAccess('denied');
              cyberAudio.playAccessDenied();
            }}
            className="px-2 py-1 border border-red-500/60 bg-red-950/30 hover:bg-red-900/50 text-red-400 text-xs font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer"
            title="Press ESC on keyboard"
          >
            <ShieldAlert className="w-3 h-3" />
            <span className="hidden sm:inline">Access</span> Denied
          </button>
        </div>
      </div>

      {/* Script Selector & Parameters */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs bg-[#011408] p-1.5 border border-[#00ff66]/20 rounded">
        <div className="flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-[#00ff66]" />
          <span className="text-neutral-400 hidden sm:inline">Script:</span>
          <select
            value={selectedSnippetIdx}
            onChange={(e) => handleSnippetChange(Number(e.target.value))}
            className="bg-[#020b04] border border-[#00ff66]/40 text-[#00ff66] px-2 py-0.5 text-xs rounded focus:outline-none"
          >
            {CODE_SNIPPETS.map((snip, idx) => (
              <option key={snip.id} value={idx}>
                {snip.name} ({snip.language})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
          <span>Chars/Key:</span>
          {[2, 4, 8].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedPerKey(s)}
              className={`px-1.5 py-0.5 border rounded-xs ${
                speedPerKey === s
                  ? 'border-[#00ff66] bg-[#00ff66]/30 text-[#00ff66] font-bold'
                  : 'border-neutral-800 text-neutral-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Editor Area */}
      <div
        ref={containerRef}
        className="flex-1 border border-[#00ff66]/50 bg-[#010a04] p-3 text-xs leading-relaxed overflow-y-auto rounded font-mono box-glow-green relative"
      >
        {charIndex === 0 ? (
          <div className="text-neutral-400 flex flex-col items-center justify-center h-full text-center space-y-2">
            <Keyboard className="w-8 h-8 text-[#00ff66]/60 animate-bounce" />
            <div className="text-sm font-bold text-[#00ff66]">
              Press ANY Key on your physical keyboard to start typing code
            </div>
            <div className="text-xs text-neutral-500 max-w-sm">
              Press <span className="text-[#00ff66] font-bold">[TAB]</span> for Access Granted •{' '}
              <span className="text-red-400 font-bold">[ESC]</span> for Access Denied • or click
              Auto-Type above.
            </div>
          </div>
        ) : (
          <pre className="text-[#00ff66] whitespace-pre-wrap">
            {currentCode}
            <span className="animate-cursor font-bold inline-block">█</span>
          </pre>
        )}
      </div>

      {/* Mobile/Virtual Typing Tap Bar */}
      <div className="mt-2 flex items-center justify-between text-xs border-t border-[#00ff66]/20 pt-2 text-neutral-400">
        <div className="flex items-center gap-3">
          <span>
            KEYSTROKES: <strong className="text-[#00ff66]">{keystrokes}</strong>
          </span>
          <span>
            BYTES: <strong className="text-[#00ff66]">{charIndex}</strong>
          </span>
        </div>

        {/* Tap-to-type button for mobile touch devices */}
        <button
          onClick={() => {
            cyberAudio.playKeyClick();
            setKeystrokes((k) => k + 1);
            setCharIndex((idx) => Math.min(fullCode.length, idx + speedPerKey));
          }}
          className="md:hidden px-3 py-1 border border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] font-bold text-xs rounded active:scale-95"
        >
          ⌨️ Tap to Code
        </button>
      </div>
    </div>
  );
};
