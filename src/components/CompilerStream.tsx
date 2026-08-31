import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Cpu, Layers } from 'lucide-react';
import { CODE_SNIPPETS } from '../data/codeSnippets';

const TELEMETRY_PHRASES = [
  'Allocating page frames at 0x7FFF9420...',
  'Compressing http://socket.gateway/stream/v2',
  'Encryption Handshake [AES-256-GCM] Started...',
  'Authorized... Compilation of Data Structures Started',
  'Parsing AST Abstract Syntax Tree nodes...',
  'Resolving BGP routing table metrics (AS64512)...',
  'Analyzing zero-knowledge cryptographic proof vector...',
  'Memory alignment 64-byte AVX-512 vectorization enabled',
  'Linking dynamic ELF binaries against libcrypto.so.3',
  'Access validation check completed... [STATUS: OK]',
  'Compilation of Data Structures Complete.',
];

export const CompilerStream: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [floatingEntropy, setFloatingEntropy] = useState<string[]>([
    '0.39518991',
    '0.73928775',
    '0.95142347',
    '0.63748721',
  ]);
  const [progress, setProgress] = useState(42);
  const [streamSpeed, setStreamSpeed] = useState<'normal' | 'fast' | 'ultra'>('fast');

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const telemetryContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentSnippet = CODE_SNIPPETS[snippetIndex];

  // Animated Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x += 2) {
        const freq1 = Math.sin((x + step) * 0.08) * (height * 0.25);
        const freq2 = Math.sin((x - step * 1.5) * 0.15) * (height * 0.15);
        const y = isStreaming ? mid + freq1 + freq2 : mid;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      if (isStreaming) {
        step += 2;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isStreaming]);

  // Code Streaming Loop
  useEffect(() => {
    if (!isStreaming) return;

    const fullCode = currentSnippet.code;
    const charStep = streamSpeed === 'normal' ? 3 : streamSpeed === 'fast' ? 7 : 16;
    const intervalMs = streamSpeed === 'normal' ? 50 : streamSpeed === 'fast' ? 30 : 15;

    const interval = setInterval(() => {
      setStreamedText(prev => {
        if (prev.length >= fullCode.length) {
          // Loop to next snippet
          setSnippetIndex(i => (i + 1) % CODE_SNIPPETS.length);
          return '';
        }
        return fullCode.substring(0, prev.length + charStep);
      });

      // Update progress
      setProgress(p => (p >= 100 ? 0 : p + 1));

      // Periodically add telemetry message & rotate entropy floats
      if (Math.random() > 0.7) {
        const phrase = TELEMETRY_PHRASES[Math.floor(Math.random() * TELEMETRY_PHRASES.length)];
        setTelemetryLogs(logs => [...logs.slice(-15), phrase]);

        setFloatingEntropy([
          Math.random().toFixed(8),
          Math.random().toFixed(8),
          Math.random().toFixed(8),
          Math.random().toFixed(8),
        ]);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isStreaming, snippetIndex, streamSpeed, currentSnippet]);

  // Auto-scroll terminals
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
    if (telemetryContainerRef.current) {
      telemetryContainerRef.current.scrollTop = telemetryContainerRef.current.scrollHeight;
    }
  }, [streamedText, telemetryLogs]);

  return (
    <div className="flex flex-col h-full bg-[#030d06] text-[#00ff66] font-mono text-sm select-none p-3 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#00ff66]/30 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 rounded-sm cursor-pointer ${
              isStreaming
                ? 'border-amber-500/70 bg-amber-950/30 text-amber-300'
                : 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/40'
            }`}
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            {isStreaming ? 'Pause' : 'Stream'}
          </button>

          <button
            onClick={() => {
              setStreamedText('');
              setSnippetIndex((i) => (i + 1) % CODE_SNIPPETS.length);
            }}
            className="px-2.5 py-1 border border-neutral-700 hover:border-[#00ff66]/60 text-neutral-300 text-xs flex items-center gap-1 rounded-sm cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Next Routine
          </button>
        </div>

        {/* Speed switch */}
        <div className="flex items-center gap-1 text-xs">
          {(['normal', 'fast', 'ultra'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setStreamSpeed(spd)}
              className={`px-2 py-0.5 border text-[10px] uppercase rounded-xs transition-all ${
                streamSpeed === spd
                  ? 'border-[#00ff66] bg-[#00ff66]/30 text-[#00ff66]'
                  : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {spd}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Top Section: Wireframe Tunnel & Oscilloscope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        {/* Wireframe Tunnel Graphic Box (Matching video aesthetic) */}
        <div className="border border-[#00ff66]/40 bg-[#011408] p-2 rounded relative h-28 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 z-10">
            <span className="flex items-center gap-1 text-[#00ff66]">
              <Layers className="w-3 h-3" />
              DMA Entropy Tunnel
            </span>
            <span className="text-amber-400 font-bold">0x{progress.toString(16).toUpperCase()}</span>
          </div>

          {/* Perspective 3D Wireframe Tunnel SVG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Expanding nested perspective rectangles */}
              <rect x="10" y="10" width="180" height="80" fill="none" stroke="#00ff66" strokeWidth="0.7" opacity="0.9" />
              <rect x="35" y="22" width="130" height="56" fill="none" stroke="#00ff66" strokeWidth="0.7" opacity="0.7" />
              <rect x="60" y="34" width="80" height="32" fill="none" stroke="#00ff66" strokeWidth="0.7" opacity="0.5" />
              <rect x="80" y="42" width="40" height="16" fill="none" stroke="#00ff66" strokeWidth="0.7" opacity="0.3" />
              {/* Corner vanishing lines */}
              <line x1="10" y1="10" x2="80" y2="42" stroke="#00ff66" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.4" />
              <line x1="190" y1="10" x2="120" y2="42" stroke="#00ff66" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.4" />
              <line x1="10" y1="90" x2="80" y2="58" stroke="#00ff66" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.4" />
              <line x1="190" y1="90" x2="120" y2="58" stroke="#00ff66" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.4" />
            </svg>
          </div>

          {/* Floating numeric entropy values */}
          <div className="z-10 text-[10px] space-y-0.5 font-bold">
            {floatingEntropy.map((val, idx) => (
              <div key={idx} className="text-[#00ff66] drop-shadow">
                {val}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#002b12] h-1.5 rounded-full overflow-hidden z-10 border border-[#00ff66]/30">
            <div
              className="bg-[#00ff66] h-full transition-all duration-100 glow-green"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Oscilloscope & Telemetry Callouts */}
        <div className="border border-[#00ff66]/40 bg-[#011408] p-2 rounded flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-neutral-400">SIGNAL FREQUENCY:</span>
            <canvas ref={canvasRef} width={120} height={20} className="border border-[#00ff66]/30 rounded bg-black/40" />
          </div>

          {/* Telemetry Stream */}
          <div
            ref={telemetryContainerRef}
            className="flex-1 overflow-y-auto text-[10px] my-1 space-y-0.5 border-y border-[#00ff66]/20 py-1"
          >
            {telemetryLogs.map((log, i) => (
              <div key={i} className="text-[#00ff66]/80 truncate">
                &gt; {log}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] pt-1">
            <span className="text-neutral-400">ACTIVE COMPILER:</span>
            <span className="text-[#00ff66] font-bold">
              {currentSnippet.name} ({currentSnippet.language})
            </span>
          </div>
        </div>
      </div>

      {/* Main Code Generation Live Output */}
      <div
        ref={codeContainerRef}
        className="flex-1 border border-[#00ff66]/40 bg-[#010903] p-2.5 text-xs leading-relaxed overflow-y-auto rounded font-mono select-text"
      >
        <pre className="text-[#00ff66] whitespace-pre-wrap">
          {streamedText}
          {isStreaming && <span className="animate-cursor font-bold">█</span>}
        </pre>
      </div>
    </div>
  );
};
