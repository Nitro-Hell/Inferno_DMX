export type WindowId = 'miner' | 'executor' | 'generator' | 'cracker' | 'ledger' | 'system';

export type ThemeMode = 'green' | 'amber' | 'cyan' | 'monochrome';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Bitcoin Block & Mining Types
export interface BlockHeader {
  version: number;
  prevBlockHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: string; // Compact target
  nonce: number;
}

export interface MinedBlock {
  height: number;
  hash: string;
  prevHash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  txCount: number;
  rewardBtc: number;
  timestamp: string;
  timeTakenSec: number;
  minerId: string;
}

export interface MempoolTransaction {
  txid: string;
  feeSat: number;
  sizeBytes: number;
  feeRateSatVb: number;
  sender: string;
  receiver: string;
  amountBtc: number;
}

// Code Execution Types
export interface ExecutionResult {
  status: 'success' | 'error' | 'timeout' | 'idle';
  output: string[];
  returnValue?: any;
  executionTimeMs: number;
  memoryUsedKb: number;
  variablesState?: Record<string, any>;
  errorDetails?: string;
}

export interface CodeTemplate {
  id: string;
  title: string;
  language: 'javascript' | 'typescript' | 'python' | 'cpp' | 'rust';
  category: 'Cryptography' | 'Distributed Systems' | 'Algorithms' | 'Security';
  code: string;
  description: string;
  expectedOutput: string;
}

// Auto Generation Types
export interface GenerationPrompt {
  id: string;
  title: string;
  description: string;
  targetLang: string;
  category: string;
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  generatedCode: string;
  architectureDetails: string[];
}
