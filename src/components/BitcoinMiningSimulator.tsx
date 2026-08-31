import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  GitBranch,
  Coins,
  Server,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { doubleSha256 } from '../utils/crypto';
import { MinedBlock, MempoolTransaction, BlockHeader } from '../types';
import { cyberAudio } from '../utils/audio';

const INITIAL_MEMPOOL_TXS: MempoolTransaction[] = [
  {
    txid: 'a7b8e91c2f...3d4e',
    feeSat: 14200,
    sizeBytes: 245,
    feeRateSatVb: 57.9,
    sender: 'bc1qar0srrr...9f8x',
    receiver: 'bc1q9v9w0...k2lm',
    amountBtc: 1.4502,
  },
  {
    txid: 'f4c1d8820a...99ba',
    feeSat: 22800,
    sizeBytes: 380,
    feeRateSatVb: 60.0,
    sender: '1A1zP1eP5Q...KrnL',
    receiver: 'bc1q55k3m...0p0w',
    amountBtc: 3.8219,
  },
  {
    txid: '39d2c1149e...77c1',
    feeSat: 8900,
    sizeBytes: 192,
    feeRateSatVb: 46.3,
    sender: '3J98t1WpEZ...Node',
    receiver: 'bc1qx7y8z...a8c9',
    amountBtc: 0.2854,
  },
  {
    txid: '9901fe44cc...1123',
    feeSat: 16500,
    sizeBytes: 260,
    feeRateSatVb: 63.4,
    sender: 'bc1qsec99...x333',
    receiver: 'bc1q7x4m8...2188',
    amountBtc: 0.9124,
  },
];

export const BitcoinMiningSimulator: React.FC = () => {
  const [isMining, setIsMining] = useState(true);
  const [leadingZerosRequired, setLeadingZerosRequired] = useState(3); // e.g. "000" for fast educational demo
  const [blockHeight, setBlockHeight] = useState(884392);
  const [nonce, setNonce] = useState(0);
  const [prevHash, setPrevHash] = useState('000000000000000000028a49c95d2c5e4f71a0b3e6d8c2e1f4a7b9c0d3e5f7a1');
  const [merkleRoot, setMerkleRoot] = useState('7e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a');
  const [currentHash, setCurrentHash] = useState('0000000000000000000000000000000000000000000000000000000000000000');
  const [hashrate, setHashrate] = useState(148.5); // TH/s
  const [totalBtcMined, setTotalBtcMined] = useState(12.5);
  const [hashesComputed, setHashesComputed] = useState(0);
  const [activeTab, setActiveTab] = useState<'console' | 'header' | 'merkle' | 'chain'>('console');
  const [isAsicTurbo, setIsAsicTurbo] = useState(false);

  const [minedBlocks, setMinedBlocks] = useState<MinedBlock[]>([
    {
      height: 884391,
      hash: '00028a49c95d2c5e4f71a0b3e6d8c2e1f4a7b9c0d3e5f7a1884391aa9944c211',
      prevHash: '00055c11099238e88f72a0b3e6d8c2e1f4a7b9c0d3e5f7a1884390bb8822d100',
      merkleRoot: '7e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a8f4c2d1b0e9a',
      nonce: 49281,
      difficulty: 84.2,
      txCount: 2419,
      rewardBtc: 3.125,
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
      timeTakenSec: 14.2,
      minerId: 'Pool-Node#01',
    },
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[INIT] Bitcoin Proof-of-Work Distributed Consensus Engine v26.0',
    '[STRATUM] Connected to stratum+tcp://btc-pool.cluster.sec:3333',
    '[BLOCK] Subscribed to block template candidate #884392',
    '[TARGET] Difficulty threshold: ' + '0'.repeat(leadingZerosRequired) + 'f'.repeat(64 - leadingZerosRequired),
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  // Target prefix based on required leading zeros
  const targetPrefix = '0'.repeat(leadingZerosRequired);

  // Single step mining evaluation
  const evaluateHash = useCallback(
    async (candidateNonce: number) => {
      const headerStr = `${prevHash}-${merkleRoot}-${candidateNonce}-1725100000`;
      const hash = await doubleSha256(headerStr);
      setCurrentHash(hash);
      return hash;
    },
    [prevHash, merkleRoot]
  );

  // Mining cycle loop
  useEffect(() => {
    if (!isMining) return;

    const batchSize = isAsicTurbo ? 48 : 8;
    const intervalMs = isAsicTurbo ? 40 : 80;

    const timer = setInterval(async () => {
      let foundBlock = false;
      let matchedHash = '';
      let matchedNonce = nonce;

      // Process a batch of nonces
      for (let i = 0; i < batchSize; i++) {
        const nextNonce = matchedNonce + 1;
        matchedNonce = nextNonce;
        const candidateHash = await evaluateHash(nextNonce);

        if (candidateHash.startsWith(targetPrefix)) {
          foundBlock = true;
          matchedHash = candidateHash;
          break;
        }
      }

      setNonce(matchedNonce);
      setHashesComputed((h) => h + batchSize);
      setHashrate((hr) => {
        const base = isAsicTurbo ? 380 : 148;
        return Number((base + (Math.random() * 10 - 5)).toFixed(1));
      });

      if (foundBlock) {
        cyberAudio.playBlockFoundSound();
        const timeTaken = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
        startTimeRef.current = Date.now();

        const blockReward = 3.125 + 0.142; // Subsidy + mempool fees
        setTotalBtcMined((b) => Number((b + blockReward).toFixed(4)));

        const newBlock: MinedBlock = {
          height: blockHeight,
          hash: matchedHash,
          prevHash: prevHash,
          merkleRoot: merkleRoot,
          nonce: matchedNonce,
          difficulty: leadingZerosRequired * 28.4,
          txCount: INITIAL_MEMPOOL_TXS.length + 1,
          rewardBtc: blockReward,
          timestamp: new Date().toLocaleTimeString(),
          timeTakenSec: Number(timeTaken),
          minerId: 'Local-ASIC-Worker#01',
        };

        setMinedBlocks((prev) => [newBlock, ...prev.slice(0, 10)]);
        setLogs((prev) => [
          ...prev.slice(-30),
          `>>> [PROOF-OF-WORK VERIFIED] Block #${blockHeight} FOUND!`,
          `    Hash: ${matchedHash}`,
          `    Nonce: ${matchedNonce} | Time: ${timeTaken}s | Reward: +${blockReward.toFixed(4)} BTC`,
          `    Broadcasting BlockHeader to Bitcoin P2P Gossip Network...`,
        ]);

        // Advance to next block candidate
        setBlockHeight((h) => h + 1);
        setPrevHash(matchedHash);
        // Generate new synthetic merkle root
        setMerkleRoot(
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        );
        setNonce(0);
      } else if (Math.random() > 0.85) {
        setLogs((prev) => [
          ...prev.slice(-30),
          `[MINER] Nonce 0x${matchedNonce.toString(16).toUpperCase()} | Hash: ${currentHash.substring(
            0,
            16
          )}... [Diff: Below Target]`,
        ]);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    isMining,
    nonce,
    isAsicTurbo,
    targetPrefix,
    leadingZerosRequired,
    blockHeight,
    prevHash,
    merkleRoot,
    evaluateHash,
    currentHash,
  ]);

  const handleManualStep = async () => {
    const nextNonce = nonce + 1;
    setNonce(nextNonce);
    cyberAudio.playKeyClick();
    const hash = await evaluateHash(nextNonce);
    setLogs((prev) => [
      ...prev.slice(-30),
      `[STEP] Nonce #${nextNonce} -> Hash: ${hash.substring(0, 24)}...`,
    ]);
  };

  const handleResetMining = () => {
    setIsMining(false);
    setNonce(0);
    setHashesComputed(0);
    setTotalBtcMined(0);
    cyberAudio.playKeyClick();
    setLogs((prev) => [...prev, '[RESET] Proof-of-Work parameters and ledger counter reset.']);
  };

  return (
    <div className="flex flex-col h-full bg-[#030d06] text-[#00ff66] font-mono text-sm select-none p-3 overflow-y-auto">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00ff66]/30 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              setIsMining(!isMining);
            }}
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
            onClick={handleManualStep}
            disabled={isMining}
            className={`px-2.5 py-1.5 border text-xs uppercase flex items-center gap-1 rounded-sm ${
              isMining
                ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                : 'border-[#00ff66]/60 bg-[#00ff66]/10 text-[#00ff66] hover:bg-[#00ff66]/30 cursor-pointer'
            }`}
            title="Step through single nonce evaluation"
          >
            <ChevronRight className="w-3 h-3" />
            Step Nonce
          </button>

          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              setIsAsicTurbo(!isAsicTurbo);
            }}
            className={`px-3 py-1.5 border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-sm cursor-pointer ${
              isAsicTurbo
                ? 'border-amber-400 bg-amber-950/40 text-amber-300 box-glow-amber'
                : 'border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:text-[#00ff66]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isAsicTurbo ? 'ASIC Turbo (x48)' : 'Standard Power'}
          </button>
        </div>

        {/* Difficulty Target Selector */}
        <div className="flex items-center gap-2 text-xs bg-[#011408] border border-[#00ff66]/30 px-2.5 py-1 rounded">
          <Sliders className="w-3.5 h-3.5 text-[#00ff66]" />
          <span className="text-neutral-400">Target Zeros:</span>
          {[1, 2, 3, 4, 5].map((z) => (
            <button
              key={z}
              onClick={() => {
                setLeadingZerosRequired(z);
                cyberAudio.playKeyClick();
              }}
              className={`px-1.5 py-0.5 border text-[10px] rounded-xs font-bold ${
                leadingZerosRequired === z
                  ? 'border-[#00ff66] bg-[#00ff66] text-black'
                  : 'border-neutral-800 text-neutral-500 hover:text-white'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        <button
          onClick={handleResetMining}
          className="text-neutral-500 hover:text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
          title="Reset Parameters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-[#00ff66]/20 mb-3 text-xs">
        {[
          { id: 'console', label: 'Live PoW Engine', icon: <Activity className="w-3 h-3" /> },
          { id: 'header', label: 'Block Header Structure', icon: <Cpu className="w-3 h-3" /> },
          { id: 'merkle', label: 'Merkle Tree & Mempool', icon: <GitBranch className="w-3 h-3" /> },
          { id: 'chain', label: 'Blockchain Ledger', icon: <Database className="w-3 h-3" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              cyberAudio.playKeyClick();
            }}
            className={`px-3 py-1.5 flex items-center gap-1.5 border-b-2 font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Main PoW Mining Console */}
      {activeTab === 'console' && (
        <div className="flex flex-col flex-1 gap-3">
          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="border border-[#00ff66]/30 bg-[#011408] p-2 rounded">
              <span className="text-neutral-400 block text-[10px]">CANDIDATE BLOCK</span>
              <span className="text-[#00ff66] font-bold text-base">#{blockHeight}</span>
            </div>
            <div className="border border-[#00ff66]/30 bg-[#011408] p-2 rounded">
              <span className="text-neutral-400 block text-[10px]">CURRENT HASHRATE</span>
              <span className="text-[#00ff66] font-bold text-base flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#00ff66]" />
                {hashrate} TH/s
              </span>
            </div>
            <div className="border border-[#00ff66]/30 bg-[#011408] p-2 rounded">
              <span className="text-neutral-400 block text-[10px]">NONCE ITERATION</span>
              <span className="text-amber-400 font-bold text-base">
                0x{nonce.toString(16).toUpperCase()}
              </span>
            </div>
            <div className="border border-[#00ff66]/30 bg-[#011408] p-2 rounded box-glow-green">
              <span className="text-neutral-400 block text-[10px]">REWARD ACCUMULATED</span>
              <span className="text-[#00ff66] font-bold text-base glow-green">
                {totalBtcMined.toFixed(4)} BTC
              </span>
            </div>
          </div>

          {/* Double SHA-256 Live Hash Comparator */}
          <div className="border-2 border-[#00ff66]/50 bg-[#010e05] p-3 rounded space-y-2 box-glow-green">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 flex items-center gap-1 font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#00ff66]" />
                DOUBLE SHA-256 OUTPUT (SHA256(SHA256(BlockHeader)))
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-[#00ff66]/40 bg-[#00ff66]/20 text-[#00ff66] rounded font-bold">
                Target: {targetPrefix}* ({leadingZerosRequired} leading zeros)
              </span>
            </div>

            {/* Current Hash Output Display with Highlighted Prefix */}
            <div className="p-2.5 bg-black/80 border border-[#00ff66]/40 rounded font-mono text-xs break-all">
              <span className="text-[#00ff66] font-bold bg-[#00ff66]/20 px-1 py-0.5 rounded mr-1">
                {currentHash.substring(0, leadingZerosRequired)}
              </span>
              <span className="text-neutral-300">{currentHash.substring(leadingZerosRequired)}</span>
            </div>

            {/* Status callout */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>Previous Hash: {prevHash.substring(0, 24)}...</span>
              <span>Merkle Root: {merkleRoot.substring(0, 16)}...</span>
            </div>
          </div>

          {/* Real-time Mining Stream Terminal */}
          <div
            ref={logsEndRef}
            className="flex-1 min-h-[140px] border border-[#00ff66]/30 bg-[#010903] p-2.5 text-[11px] leading-relaxed overflow-y-auto rounded font-mono"
          >
            {logs.map((log, i) => {
              const isMatch = log.includes('FOUND') || log.includes('VERIFIED');
              return (
                <div
                  key={i}
                  className={`transition-colors ${
                    isMatch
                      ? 'text-black bg-[#00ff66] font-bold px-1.5 py-0.5 my-0.5 rounded glow-green'
                      : 'text-[#00ff66]/90'
                  }`}
                >
                  {log}
                </div>
              );
            })}
            {isMining && <span className="animate-cursor font-bold inline-block">_</span>}
          </div>
        </div>
      )}

      {/* TAB 2: 80-Byte Block Header Structure */}
      {activeTab === 'header' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="text-xs text-neutral-400">
            Bitcoin miners iterate over this exact 80-byte data structure, incrementing the 4-byte
            nonce until the double SHA-256 digest is numerically lower than the current network target.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="border border-[#00ff66]/40 bg-[#011408] p-3 rounded space-y-2">
              <div className="flex justify-between border-b border-[#00ff66]/20 pb-1">
                <span className="text-neutral-400">1. Version (4 Bytes):</span>
                <span className="text-[#00ff66] font-bold">0x20000000 (BIP9 Signaling)</span>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 block">2. Previous Block Hash (32 Bytes):</span>
                <div className="p-1.5 bg-black/60 border border-[#00ff66]/20 rounded break-all text-[11px]">
                  {prevHash}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 block">3. Merkle Root Hash (32 Bytes):</span>
                <div className="p-1.5 bg-black/60 border border-[#00ff66]/20 rounded break-all text-[11px]">
                  {merkleRoot}
                </div>
              </div>
            </div>

            <div className="border border-[#00ff66]/40 bg-[#011408] p-3 rounded space-y-2">
              <div className="flex justify-between border-b border-[#00ff66]/20 pb-1">
                <span className="text-neutral-400">4. Timestamp (4 Bytes):</span>
                <span className="text-[#00ff66] font-bold">
                  {Math.floor(Date.now() / 1000)} (UNIX Epoch)
                </span>
              </div>
              <div className="flex justify-between border-b border-[#00ff66]/20 pb-1">
                <span className="text-neutral-400">5. Target Bits (4 Bytes):</span>
                <span className="text-amber-400 font-bold">0x1d00ffff (Compact Format)</span>
              </div>
              <div className="flex justify-between border-b border-[#00ff66]/20 pb-1">
                <span className="text-neutral-400">6. Nonce (4 Bytes):</span>
                <span className="text-[#00ff66] font-bold">
                  {nonce} (0x{nonce.toString(16).toUpperCase()})
                </span>
              </div>
              <div className="p-2 bg-[#021f0c] border border-[#00ff66]/30 rounded text-[11px] text-neutral-300">
                Total Header Size: <strong>80 Bytes</strong> • Nonce Space: 0 to 4,294,967,295 (2^32)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Merkle Tree & Mempool Transactions */}
      {activeTab === 'merkle' && (
        <div className="flex-1 overflow-y-auto space-y-3 text-xs">
          <div className="text-neutral-400">
            Transactions in the memory pool are combined into cryptographic pairs and hashed recursively
            to form a single 32-byte <strong>Merkle Root</strong> in the block header.
          </div>

          <div className="border border-[#00ff66]/40 bg-[#011408] p-3 rounded">
            <div className="font-bold text-[#00ff66] mb-2 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              Merkle Tree Assembly for Candidate Block #{blockHeight}
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-[#021f0c] border border-[#00ff66]/30 rounded text-center font-bold">
                ROOT HASH: {merkleRoot.substring(0, 32)}...
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="p-1.5 border border-[#00ff66]/20 bg-black/40 rounded">
                  H(Tx1 + Tx2) Branch Alpha
                </div>
                <div className="p-1.5 border border-[#00ff66]/20 bg-black/40 rounded">
                  H(Tx3 + Tx4) Branch Beta
                </div>
              </div>
            </div>
          </div>

          {/* Pending Mempool Table */}
          <div className="border border-[#00ff66]/30 bg-[#011408] p-2.5 rounded">
            <div className="font-bold text-[#00ff66] mb-1.5">Selected High-Fee Mempool Transactions</div>
            <div className="space-y-1.5">
              {INITIAL_MEMPOOL_TXS.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 bg-black/50 border border-[#00ff66]/20 rounded text-[11px]"
                >
                  <div>
                    <span className="text-[#00ff66] font-bold">TX #{idx + 1}: </span>
                    <span className="text-neutral-300">{tx.txid}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <span>{tx.amountBtc} BTC</span>
                    <span className="text-amber-400 font-bold">{tx.feeRateSatVb} sat/vB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Mined Blockchain Ledger */}
      {activeTab === 'chain' && (
        <div className="flex-1 overflow-y-auto space-y-2 text-xs">
          <div className="text-neutral-400 mb-1">
            Immutable ledger of successfully verified Proof-of-Work blocks:
          </div>

          {minedBlocks.map((blk) => (
            <div
              key={blk.height}
              className="border border-[#00ff66]/40 bg-[#011408] p-2.5 rounded hover:border-[#00ff66] transition-all space-y-1"
            >
              <div className="flex justify-between items-center font-bold">
                <span className="text-[#00ff66] flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  Block #{blk.height}
                </span>
                <span className="text-amber-400">{blk.rewardBtc} BTC Reward</span>
              </div>
              <div className="text-[11px] text-neutral-300 font-mono break-all">
                Hash: {blk.hash}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 pt-1 border-t border-[#00ff66]/20">
                <span>Nonce: {blk.nonce.toLocaleString()}</span>
                <span>Time to solve: {blk.timeTakenSec}s</span>
                <span>Timestamp: {blk.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
