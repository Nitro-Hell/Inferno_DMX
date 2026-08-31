import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, RotateCcw, Activity } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

const MINING_POOLS = [
  'stratum+tcp://btc-pool.node-sec.net:3333',
  'stratum+tcp://asia-cluster.hashpower.io:4444',
  'stratum+tcp://us-east.validator-node.org:8333',
];

const CODE_WORDS = ['GMEK', 'QPIN', 'MOHT', 'ZETA', 'KRON', 'VEXA', 'NX77', 'BYTE', 'CYPR'];

export const BitcoinMiner: React.FC = () => {
  const [isMining, setIsMining] = useState(true);
  const [btcBalance, setBtcBalance] = useState(8.0);
  const [hashrate, setHashrate] = useState(138.4);
  const [difficulty, setDifficulty] = useState('147M');
  const [blockHeight, setBlockHeight] = useState(884219);
  const [acceptedShares, setAcceptedShares] = useState(1986);
  const [rejectedShares, setRejectedShares] = useState(4);
  const [isBoosted, setIsBoosted] = useState(false);
  const [pickaxeAngle, setPickaxeAngle] = useState(0);

  const [logs, setLogs] = useState<string[]>([
    '1985. KRON - [19:52:40] Resp Ax91v | Diff: 71/217 | Nonce verified',
    '1986. GMEK - [19:52:41] Resp Qpvie108 | No match Cg:84 | Diff: 65/217',
    '1987. QPIN - [19:52:42] Resp Eavms149 | No match Pr:27 | Diff: 24/012',
    '1988. MOHT - [19:52:43] Resp Zx880 | Diff: 89/217 | Block match candidate'
  ]);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Mining loop & Pickaxe animation
  useEffect(() => {
    if (!isMining) return;

    // Pickaxe swing animation
    const swingInterval = setInterval(() => {
      setPickaxeAngle(prev => (prev === 0 ? -45 : 0));
    }, 280);

    // Hash generation interval
    const miningInterval = setInterval(() => {
      // Fluctuating hashrate
      const baseHash = isBoosted ? 385 : 138;
      setHashrate(Number((baseHash + (Math.random() * 12 - 6)).toFixed(1)));

      const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const diff1 = Math.floor(Math.random() * 90 + 10);
      const randomNonce = Math.random().toString(36).substring(2, 9);
      const isLucky = Math.random() > 0.88;

      setAcceptedShares(prev => prev + 1);

      if (isLucky) {
        // Solved share or micro-reward
        const reward = Number((Math.random() * 0.05 + 0.01).toFixed(4));
        setBtcBalance(prev => Number((prev + reward).toFixed(4)));
        cyberAudio.playBlockFoundSound();

        setLogs(prev => [
          ...prev.slice(-40),
          `>>> [BLOCK FOUND] ${word} - [${timeStr}] Nonce #0x${randomNonce.toUpperCase()} MATCH! Diff: ${diff1}/217 (+${reward} BTC)`
        ]);
        setBlockHeight(b => b + 1);
      } else {
        setLogs(prev => [
          ...prev.slice(-40),
          `${acceptedShares + 1}. ${word} - [${timeStr}] Resp ${randomNonce} | No match | Diff: ${diff1}/217`
        ]);
      }
    }, isBoosted ? 350 : 700);

    return () => {
      clearInterval(swingInterval);
      clearInterval(miningInterval);
    };
  }, [isMining, isBoosted, acceptedShares]);

  const toggleMining = () => {
    setIsMining(!isMining);
    cyberAudio.playKeyClick();
  };

  const toggleBoost = () => {
    setIsBoosted(!isBoosted);
    cyberAudio.playKeyClick();
  };

  const handleResetBalance = () => {
    setBtcBalance(0);
    setAcceptedShares(0);
    setRejectedShares(0);
    cyberAudio.playKeyClick();
  };

  return (
    <div className="flex flex-col h-full bg-[#030d06] text-[#00ff66] font-mono text-sm select-none p-3 overflow-y-auto">
      {/* Top Header info / Node metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00ff66]/30 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            id="miner-toggle-btn"
            onClick={toggleMining}
            className={`px-3.5 py-1.5 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-sm cursor-pointer ${
              isMining
                ? 'border-red-500/80 bg-red-950/40 text-red-400 hover:bg-red-900/60'
                : 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] hover:bg-[#00ff66]/40 hover:box-glow-green'
            }`}
          >
            {isMining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isMining ? 'Pause Mining' : 'Start Mining'}
          </button>

          <button
            id="miner-boost-btn"
            onClick={toggleBoost}
            className={`px-3 py-1.5 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-sm cursor-pointer ${
              isBoosted
                ? 'border-amber-400 bg-amber-950/40 text-amber-300 box-glow-amber'
                : 'border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:text-[#00ff66] hover:border-[#00ff66]/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isBoosted ? 'ASIC Turbo ON' : 'Turbo Boost'}
          </button>
        </div>

        <button
          onClick={handleResetBalance}
          className="text-neutral-500 hover:text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
          title="Reset Counters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Node Status Banner & Wallet Display (2-column layout matching video) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Left: Node Connection Info */}
        <div className="border border-[#00ff66]/30 bg-[#011207] p-2.5 rounded text-xs space-y-1.5">
          <div className="flex justify-between items-center pb-1 border-b border-[#00ff66]/20">
            <span className="text-neutral-400">Node IP:</span>
            <span className="text-[#00ff66] font-bold">128.154.26.11</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Connected Pool:
            <div className="text-[#00ff66] truncate font-semibold mt-0.5">
              btcn.miner.pool-cluster.net:3333
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#00ff66]/20">
            <span className="text-neutral-400">Block Target:</span>
            <span className="text-[#00ff66]">...7e9Kq#{blockHeight}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Target Difficulty:</span>
            <span className="text-amber-400 font-bold">{difficulty}</span>
          </div>
        </div>

        {/* Right: Wallet & Animated Miner Box */}
        <div className="border-2 border-[#00ff66] bg-[#011408] p-2.5 rounded-sm flex flex-col justify-between box-glow-green relative overflow-hidden">
          {/* Subtle background matrix particles */}
          <div className="absolute right-0 top-0 w-28 h-full opacity-10 flex flex-wrap gap-1 pointer-events-none text-[8px] overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i}>₿{i}</span>
            ))}
          </div>

          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">
              Secure Wallet
            </span>
            <span className="text-[10px] px-1.5 py-0.5 border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66] rounded">
              POW-SHA256
            </span>
          </div>

          {/* Glowing BTC Balance */}
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-neutral-400 text-xs font-bold">BTC</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#00ff66] glow-green tracking-wider">
              {btcBalance.toFixed(4)}
            </span>
            <span className="text-xl text-amber-400">₿</span>
          </div>

          {/* Animated Mining Graphic (matching pickaxe & rocks in video) */}
          <div className="flex items-center justify-between border-t border-[#00ff66]/30 pt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Status:</span>
              <span className={`text-xs font-bold flex items-center gap-1 ${isMining ? 'text-[#00ff66]' : 'text-neutral-500'}`}>
                <Activity className={`w-3 h-3 ${isMining ? 'animate-spin' : ''}`} />
                {isMining ? 'Mining Active...' : 'Paused'}
              </span>
            </div>

            {/* Custom SVG animated pickaxe icon */}
            <div className="relative w-8 h-8 flex items-center justify-center bg-[#021f0c] border border-[#00ff66]/40 rounded">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#00ff66] transition-transform duration-200"
                style={{
                  transform: `rotate(${isMining ? pickaxeAngle : 0}deg)`,
                  transformOrigin: 'bottom right'
                }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m14 10 5.5-5.5a2.121 2.121 0 0 1 3 3L17 13" />
                <path d="m17 7-6 6" />
                <path d="m3 21 8.5-8.5" />
                <path d="M12 4c-3 0-6 2-7.5 4.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 mb-2 text-center text-xs">
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">HASHRATE</span>
          <span className="text-[#00ff66] font-bold">{hashrate} TH/s</span>
        </div>
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">ACCEPTED SHARES</span>
          <span className="text-[#00ff66] font-bold">{acceptedShares}</span>
        </div>
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">REJECTED</span>
          <span className="text-red-400 font-bold">{rejectedShares}</span>
        </div>
        <div className="border border-[#00ff66]/20 bg-[#001408]/40 p-1.5 rounded">
          <span className="text-neutral-400 block text-[10px]">EFFICIENCY</span>
          <span className="text-[#00ff66] font-bold">99.8%</span>
        </div>
      </div>

      {/* Live Hash Stream Terminal Output */}
      <div
        ref={logRef}
        className="flex-1 min-h-[140px] border border-[#00ff66]/30 bg-[#010903] p-2.5 text-[11px] leading-relaxed overflow-y-auto rounded font-mono"
      >
        {logs.map((log, i) => {
          const isMatch = log.includes('BLOCK FOUND') || log.includes('MATCH');
          return (
            <div
              key={i}
              className={`transition-colors ${
                isMatch
                  ? 'text-black bg-[#00ff66] font-bold px-1 my-0.5 rounded-xs glow-green'
                  : 'text-[#00ff66]/90'
              }`}
            >
              {log}
            </div>
          );
        })}
        {isMining && (
          <div className="text-[#00ff66] animate-cursor inline-block font-bold">_</div>
        )}
      </div>
    </div>
  );
};
