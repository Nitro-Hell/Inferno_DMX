import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ShieldCheck, Cpu, Database, Server } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

const TARGET_PRESETS = [
  { ip: '23.86.111.0', db: 'User table /', label: 'Auth Gateway' },
  { ip: '192.168.1.104', db: 'Shadow file /', label: 'Internal Node' },
  { ip: '10.0.42.15', db: 'Kerberos KDC /', label: 'Domain Controller' },
  { ip: '172.16.8.99', db: 'OAuth Token Store /', label: 'API Gateway' },
];

const TARGET_PASSWORDS = [
  'VJPJ_SEC99!',
  'ROOT_ALPHA#01',
  'CYBER_HASH_42',
  'QUANTUM_KEY!',
  'KRNL_BYPASS7',
];

export const PasswordCracker: React.FC = () => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [targetPassword, setTargetPassword] = useState(TARGET_PASSWORDS[0]);
  const [currentGrid, setCurrentGrid] = useState<string[][]>([
    Array(12).fill('-'),
    Array(12).fill('-')
  ]);
  const [lockedIndices, setLockedIndices] = useState<boolean[]>(Array(12).fill(false));
  const [status, setStatus] = useState<'standby' | 'running' | 'completed'>('standby');
  const [logs, setLogs] = useState<string[]>([
    'System ready for authentication resilience testing.',
    'Select target endpoint and initiate verification.'
  ]);
  const [attempts, setAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'hyper'>('fast');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const targetConfig = TARGET_PRESETS[selectedTargetIndex];

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle attack loop
  useEffect(() => {
    if (status !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    let currentLocked = [...lockedIndices];
    const passwordChars = targetPassword.padEnd(12, ' ').split('');

    const intervalMs = speed === 'normal' ? 80 : speed === 'fast' ? 40 : 15;

    timerRef.current = setInterval(() => {
      setAttempts(prev => prev + (speed === 'hyper' ? 842 : 128));
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 100) / 10);

      // Check if we should lock next character
      const nextUnlockIndex = currentLocked.findIndex(locked => !locked);

      if (nextUnlockIndex !== -1 && Math.random() > (speed === 'hyper' ? 0.6 : 0.75)) {
        currentLocked[nextUnlockIndex] = true;
        setLockedIndices([...currentLocked]);
        cyberAudio.playLockBeep(1 + nextUnlockIndex * 0.08);

        setLogs(prev => [
          ...prev.slice(-25),
          `[SHA-512] Match character position [${nextUnlockIndex + 1}/12]: '${passwordChars[nextUnlockIndex]}' (Entropy delta: +8.4)`
        ]);

        if (currentLocked.every(Boolean)) {
          setStatus('completed');
          cyberAudio.playAccessGranted();
          setLogs(prev => [
            ...prev.slice(-25),
            `------------------------------------------------`,
            `[VERIFICATION SUCCESS] Authentication token matched: "${targetPassword}"`,
            `Target Host: ${targetConfig.ip} | Time: ${((Date.now() - startTimeRef.current) / 1000).toFixed(2)}s`
          ]);
          return;
        }
      }

      // Generate random fluctuating characters for unlocked positions
      const row1 = passwordChars.map((char, idx) => {
        if (currentLocked[idx]) return char;
        return CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
      });

      const row2 = passwordChars.map((char, idx) => {
        if (currentLocked[idx]) return char;
        return CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
      });

      setCurrentGrid([row1, row2]);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, targetPassword, speed, selectedTargetIndex]);

  const handleStartCrack = () => {
    if (status === 'running') return;
    setLockedIndices(Array(12).fill(false));
    setStatus('running');
    setAttempts(0);
    setLogs([
      `Initiating cryptographic resilience test @ ${targetConfig.ip}...`,
      `Protocol: TLS 1.3 / PBKDF2 with SHA-512 digest.`,
      `Target database table: ${targetConfig.db}`,
      `Please wait for hash collision analysis...`
    ]);
  };

  const handleReset = () => {
    setStatus('standby');
    setLockedIndices(Array(12).fill(false));
    setCurrentGrid([Array(12).fill('-'), Array(12).fill('-')]);
    setAttempts(0);
    setElapsedTime(0);
    setLogs([
      'Resilience test aborted and registers cleared.',
      'System ready for next test sequence.'
    ]);
  };

  const handleTargetChange = (idx: number) => {
    setSelectedTargetIndex(idx);
    setTargetPassword(TARGET_PASSWORDS[idx % TARGET_PASSWORDS.length]);
    handleReset();
  };

  return (
    <div className="flex flex-col h-full bg-[#030d06] text-[#00ff66] font-mono text-sm select-none p-3 overflow-y-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#00ff66]/30 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            id="crack-start-btn"
            onClick={handleStartCrack}
            disabled={status === 'running'}
            className={`px-4 py-1.5 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-sm ${
              status === 'running'
                ? 'border-neutral-700 bg-neutral-900/60 text-neutral-500 cursor-not-allowed'
                : 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/40 hover:box-glow-green cursor-pointer'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Crack
          </button>
          <button
            id="crack-reset-btn"
            onClick={handleReset}
            className="px-4 py-1.5 border border-red-500/60 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:border-red-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-neutral-400 mr-1 hidden sm:inline">Speed:</span>
          {(['normal', 'fast', 'hyper'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 border text-[11px] uppercase transition-all rounded-xs ${
                speed === s
                  ? 'border-[#00ff66] bg-[#00ff66]/30 text-[#00ff66]'
                  : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Target & DB Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
        <div className="p-2 border border-[#00ff66]/20 bg-[#001408]/60 rounded">
          <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
            <Server className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Target Host / Endpoint:</span>
          </div>
          <select
            value={selectedTargetIndex}
            onChange={(e) => handleTargetChange(Number(e.target.value))}
            className="w-full bg-[#020b04] border border-[#00ff66]/40 text-[#00ff66] px-2 py-1 text-xs rounded focus:outline-none focus:border-[#00ff66]"
          >
            {TARGET_PRESETS.map((t, idx) => (
              <option key={t.ip} value={idx}>
                {t.ip} ({t.label})
              </option>
            ))}
          </select>
        </div>

        <div className="p-2 border border-[#00ff66]/20 bg-[#001408]/60 rounded">
          <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
            <Database className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Database Partition:</span>
          </div>
          <div className="bg-[#020b04] border border-[#00ff66]/30 px-2 py-1 text-xs text-[#00ff66] font-bold rounded">
            {targetConfig.db}
          </div>
        </div>
      </div>

      {/* Main Character Brute-force Matrix Grid */}
      <div className="border-2 border-[#00ff66]/50 p-3 bg-[#010904] rounded-sm mb-3 box-glow-green">
        <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#00ff66]" />
            SHA-512 Entropy Collision Matrix
          </span>
          <span className="text-[#00ff66]">
            {lockedIndices.filter(Boolean).length}/12 RESOLVED
          </span>
        </div>

        {/* Character rows */}
        <div className="space-y-1 mb-2 overflow-x-auto pb-1">
          {currentGrid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-12 gap-1 min-w-[300px]">
              {row.map((char, colIdx) => {
                const isLocked = lockedIndices[colIdx];
                return (
                  <div
                    key={colIdx}
                    className={`h-8 flex items-center justify-center font-bold text-base border transition-colors rounded-xs ${
                      isLocked
                        ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] glow-green'
                        : status === 'running'
                        ? 'border-[#00ff66]/40 bg-[#002b12]/50 text-neutral-300'
                        : 'border-neutral-800 bg-black/40 text-neutral-600'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Validation Checkmarks Row */}
          <div className="grid grid-cols-12 gap-1 min-w-[300px] pt-1">
            {lockedIndices.map((locked, idx) => (
              <div
                key={idx}
                className={`h-5 flex items-center justify-center text-xs font-bold border transition-colors rounded-xs ${
                  locked
                    ? 'border-[#00ff66] bg-[#00ff66] text-black'
                    : 'border-neutral-800 text-neutral-700 bg-black/30'
                }`}
              >
                {locked ? '✓' : 'x'}
              </div>
            ))}
          </div>
        </div>

        {/* Status Callout Banner */}
        <div
          className={`mt-2 py-1.5 px-3 border text-center text-xs font-bold tracking-wider uppercase rounded-xs transition-all ${
            status === 'running'
              ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66] animate-pulse'
              : status === 'completed'
              ? 'border-[#00ff66] bg-[#00ff66] text-black glow-green'
              : 'border-neutral-700 bg-neutral-900/60 text-neutral-400'
          }`}
        >
          {status === 'running' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
              Running Brute-Force Attack @ {targetConfig.ip}
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              COLLISION MATCH FOUND — Plaintext: {targetPassword}
            </span>
          ) : (
            'Status: Standby • Click [Crack] to start attack'
          )}
        </div>
      </div>

      {/* Metrics & Real-time Log Stream */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-center text-xs">
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">ATTEMPTS</span>
          <span className="text-[#00ff66] font-bold">{attempts.toLocaleString()}</span>
        </div>
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">ELAPSED TIME</span>
          <span className="text-[#00ff66] font-bold">{elapsedTime.toFixed(1)}s</span>
        </div>
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">HASH ALGO</span>
          <span className="text-[#00ff66] font-bold">SHA-512</span>
        </div>
      </div>

      {/* Live Console Output */}
      <div
        ref={logContainerRef}
        className="flex-1 min-h-[100px] border border-[#00ff66]/30 bg-[#010903] p-2 text-[11px] leading-relaxed overflow-y-auto rounded"
      >
        {logs.map((log, i) => (
          <div key={i} className="text-[#00ff66]/90 font-mono">
            {log}
          </div>
        ))}
        {status === 'running' && (
          <div className="text-[#00ff66] animate-cursor inline-block font-bold">█</div>
        )}
      </div>
    </div>
  );
};
