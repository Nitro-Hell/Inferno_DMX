import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Cpu,
  Layers,
  FileCode,
  Sliders,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { GenerationPrompt } from '../types';
import { cyberAudio } from '../utils/audio';

const PROMPTS: GenerationPrompt[] = [
  {
    id: 'consensus-engine',
    title: 'Byzantine Fault Tolerant Consensus Protocol',
    description: 'Generates a multi-validator state machine implementing leader proposal and 2/3 quorum voting rounds.',
    targetLang: 'TypeScript',
    category: 'Distributed Systems',
    complexity: 'Enterprise',
    architectureDetails: [
      'Round-Robin Leader Election',
      'Cryptographic Vote Verification',
      'Timeout & State Rollback Mechanism',
    ],
    generatedCode: `// Byzantine Fault Tolerant (BFT) State Machine Engine
export interface Validator {
  nodeId: string;
  votingWeight: number;
  publicKey: string;
}

export interface BlockProposal {
  round: number;
  blockHash: string;
  proposedBy: string;
  timestamp: number;
}

export class BftConsensusEngine {
  private currentRound: number = 0;
  private validators: Map<string, Validator> = new Map();
  private preparedVotes: Map<string, Set<string>> = new Map();

  constructor(initialValidators: Validator[]) {
    initialValidators.forEach(v => this.validators.set(v.nodeId, v));
  }

  public calculateQuorumThreshold(): number {
    const totalWeight = Array.from(this.validators.values())
      .reduce((sum, v) => sum + v.votingWeight, 0);
    return Math.floor((2 * totalWeight) / 3) + 1;
  }

  public async processVote(round: number, blockHash: string, fromNode: string): Promise<boolean> {
    if (!this.validators.has(fromNode)) return false;
    
    const key = \`\${round}_\${blockHash}\`;
    if (!this.preparedVotes.has(key)) {
      this.preparedVotes.set(key, new Set());
    }

    const voteSet = this.preparedVotes.get(key)!;
    voteSet.add(fromNode);

    let accumulatedWeight = 0;
    voteSet.forEach(nodeId => {
      accumulatedWeight += this.validators.get(nodeId)?.votingWeight || 0;
    });

    return accumulatedWeight >= this.calculateQuorumThreshold();
  }
}`,
  },
  {
    id: 'zk-proof',
    title: 'Zero-Knowledge Range Proof Verifier',
    description: 'Generates zero-knowledge polynomial commitment evaluation logic for confidential balance verification.',
    targetLang: 'Rust',
    category: 'Cryptography',
    complexity: 'Advanced',
    architectureDetails: [
      'Elliptic Curve Pedersen Commitments',
      'Fiat-Shamir Non-Interactive Transform',
      'Vector Inner-Product Argument',
    ],
    generatedCode: `// Zero-Knowledge Range Proof Verification Circuit
use sha2::{Sha256, Digest};

#[derive(Clone, Debug)]
pub struct PedersenCommitment {
    pub value_commitment: [u8; 32],
    pub blinding_factor: [u8; 32],
}

pub struct RangeProof {
    pub commitment_a: [u8; 32],
    pub commitment_s: [u8; 32],
    pub response_t: u64,
}

impl RangeProof {
    pub fn verify(&self, public_commitment: &[u8; 32]) -> bool {
        let mut hasher = Sha256::new();
        hasher.update(&self.commitment_a);
        hasher.update(&self.commitment_s);
        hasher.update(public_commitment);
        
        let challenge = hasher.finalize();
        // Constant-time arithmetic verification
        let is_valid = challenge[0] ^ challenge[31] != 0;
        is_valid
    }
}`,
  },
  {
    id: 'mempool-filter',
    title: 'High-Frequency Order & Mempool Matcher',
    description: 'Generates lock-free ring-buffer based transaction processing pipeline for real-time validation.',
    targetLang: 'C++',
    category: 'High Performance',
    complexity: 'Enterprise',
    architectureDetails: [
      'Lock-Free Ring Buffer',
      'SIMD Vectorized Hash Batching',
      'Zero-Copy Memory Allocations',
    ],
    generatedCode: `// Low-Latency High-Frequency Mempool Processor
#include <iostream>
#include <vector>
#include <atomic>

struct Transaction {
    uint64_t tx_id;
    uint32_t fee_rate_sat;
    uint32_t size_bytes;
    uint8_t  signature_hash[32];
};

class LockFreeMempool {
private:
    static constexpr size_t BUFFER_SIZE = 65536;
    Transaction ring_buffer[BUFFER_SIZE];
    std::atomic<uint64_t> write_index{0};
    std::atomic<uint64_t> read_index{0};

public:
    bool push_transaction(const Transaction& tx) {
        uint64_t current_write = write_index.load(std::memory_order_relaxed);
        if (current_write - read_index.load(std::memory_order_acquire) >= BUFFER_SIZE) {
            return false; // Queue Full
        }
        ring_buffer[current_write % BUFFER_SIZE] = tx;
        write_index.store(current_write + 1, std::memory_order_release);
        return true;
    }
};`,
  },
];

interface AutoCodeGeneratorProps {
  onSendToSandbox?: (code: string) => void;
}

export const AutoCodeGenerator: React.FC<AutoCodeGeneratorProps> = ({ onSendToSandbox }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<GenerationPrompt>(PROMPTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState<number>(3); // chars per tick
  const [copied, setCopied] = useState(false);

  const fullCode = selectedPrompt.generatedCode;
  const displayedCode = fullCode.slice(0, charIndex);
  const isComplete = charIndex >= fullCode.length;

  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Auto-generation streaming tick
  useEffect(() => {
    if (!isGenerating) return;

    const timer = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= fullCode.length) {
          setIsGenerating(false);
          cyberAudio.playAccessGranted();
          return fullCode.length;
        }
        if (prev % 12 === 0) {
          cyberAudio.playKeyClick();
        }
        return Math.min(prev + generationSpeed, fullCode.length);
      });
    }, 25);

    return () => clearInterval(timer);
  }, [isGenerating, fullCode, generationSpeed]);

  // Scroll to bottom as code streams in
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [displayedCode]);

  const handleStartGeneration = () => {
    setCharIndex(0);
    setIsGenerating(true);
    cyberAudio.playKeyClick();
  };

  const handleSelectPrompt = (prompt: GenerationPrompt) => {
    setSelectedPrompt(prompt);
    setCharIndex(0);
    setIsGenerating(true);
    cyberAudio.playKeyClick();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    cyberAudio.playKeyClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0714] text-[#d48aff] font-mono text-xs select-none p-3 overflow-hidden">
      {/* Top Header & Scenario Selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d48aff]/30 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-bold uppercase text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d48aff]" />
            Workflow Scenario:
          </span>
          <select
            value={selectedPrompt.id}
            onChange={(e) => {
              const p = PROMPTS.find((item) => item.id === e.target.value);
              if (p) handleSelectPrompt(p);
            }}
            className="bg-[#190d2e] border border-[#d48aff]/40 text-[#d48aff] text-xs px-2 py-1 rounded focus:outline-none focus:border-[#d48aff] cursor-pointer"
          >
            {PROMPTS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0a0714] text-[#d48aff]">
                [{p.targetLang}] {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-[#150a24] px-2 py-1 rounded border border-[#d48aff]/30">
            <Sliders className="w-3 h-3 text-[#d48aff]" />
            <span>Speed:</span>
            {[1, 3, 8].map((spd) => (
              <button
                key={spd}
                onClick={() => setGenerationSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  generationSpeed === spd
                    ? 'bg-[#d48aff] text-black'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                {spd === 1 ? '1x' : spd === 3 ? '3x' : 'Fast'}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#d48aff]" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="px-3.5 py-1.5 border border-[#d48aff] bg-[#d48aff]/20 text-[#d48aff] font-bold rounded flex items-center gap-1.5 hover:bg-[#d48aff]/30 box-glow-purple cursor-pointer transition-all disabled:opacity-50"
          >
            {isGenerating ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isGenerating ? 'Generating Code...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Main Grid: Architecture Spec & Streaming Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Architectural Blueprint Metadata */}
        <div className="flex flex-col gap-2.5 border border-[#d48aff]/40 bg-[#120a22] p-3 rounded overflow-y-auto">
          <div className="text-xs font-bold text-[#d48aff] flex items-center gap-1.5 border-b border-[#d48aff]/30 pb-1.5">
            <Layers className="w-3.5 h-3.5" />
            Generation Specifications
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-neutral-400 block text-[10px]">MODULE TITLE</span>
              <span className="text-white font-bold">{selectedPrompt.title}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">TARGET ECOSYSTEM</span>
              <span className="text-[#d48aff] font-bold">
                {selectedPrompt.targetLang} ({selectedPrompt.category})
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">DESCRIPTION</span>
              <span className="text-neutral-300 leading-tight block">{selectedPrompt.description}</span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-[#d48aff]/20">
            <span className="text-neutral-400 text-[10px] block font-bold">ARCHITECTURAL DESIGN PATTERNS</span>
            {selectedPrompt.architectureDetails.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                <CheckCircle2 className="w-3 h-3 text-[#d48aff] shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-[#d48aff]/20 space-y-1.5">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Token Progress:</span>
              <span className="text-[#d48aff] font-bold">
                {charIndex} / {fullCode.length} chars
              </span>
            </div>
            <div className="w-full bg-black/60 rounded-full h-1.5 border border-[#d48aff]/30 overflow-hidden">
              <div
                className="bg-[#d48aff] h-full transition-all duration-75"
                style={{ width: `${(charIndex / fullCode.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2 Cols): Live Synthesizing Code Stream */}
        <div className="lg:col-span-2 flex flex-col border border-[#d48aff]/40 bg-[#090513] rounded overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#d48aff]/20 bg-[#160a2b] text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#d48aff]">
              <FileCode className="w-3.5 h-3.5" />
              Automated Code Generation Stream
            </span>
            <span className="text-[10px] text-neutral-400">
              {isGenerating ? 'Synthesizing syntax tree...' : isComplete ? 'Generation Complete' : 'Idle'}
            </span>
          </div>

          {/* Code Stream Box */}
          <div
            ref={codeContainerRef}
            className="flex-1 p-3.5 bg-black/80 font-mono text-[11px] leading-relaxed overflow-y-auto select-text whitespace-pre text-[#e8c6ff]"
          >
            {displayedCode}
            {isGenerating && <span className="animate-cursor inline-block font-bold text-[#d48aff]">_</span>}
          </div>

          {/* Footer info */}
          <div className="p-2 border-t border-[#d48aff]/20 bg-[#120a22] text-[10px] text-neutral-400 flex justify-between items-center">
            <span>Deterministic Syntax Tree Generation</span>
            <span>Static Analysis: 0 Diagnostics / 0 Errors</span>
          </div>
        </div>
      </div>
    </div>
  );
};
