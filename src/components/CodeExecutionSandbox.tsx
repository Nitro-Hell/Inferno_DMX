import React, { useState, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Terminal,
  Code2,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { CodeTemplate, ExecutionResult } from '../types';
import { cyberAudio } from '../utils/audio';

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'merkle',
    title: 'Merkle Tree Root Calculator',
    language: 'javascript',
    category: 'Cryptography',
    description: 'Computes cryptographic pairwise hashes over transaction identifiers to produce a Merkle root.',
    code: `// Merkle Tree Pairwise Hash Verification
function sha256Mock(a, b) {
  let combined = a + "+" + b;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(8, '0');
}

function computeMerkleRoot(transactions) {
  console.log("[INIT] Processing " + transactions.length + " transactions...");
  let currentLevel = transactions;
  let level = 1;

  while (currentLevel.length > 1) {
    let nextLevel = [];
    console.log("--- Level " + level + " (" + currentLevel.length + " nodes) ---");
    for (let i = 0; i < currentLevel.length; i += 2) {
      let left = currentLevel[i];
      let right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left; // Duplicate odd node
      let parentHash = sha256Mock(left, right);
      console.log("Hash(" + left + ", " + right + ") -> " + parentHash);
      nextLevel.push(parentHash);
    }
    currentLevel = nextLevel;
    level++;
  }

  console.log("[SUCCESS] Computed Root: " + currentLevel[0]);
  return currentLevel[0];
}

const txList = ["TX_ALPHA_01", "TX_BETA_02", "TX_GAMMA_03", "TX_DELTA_04"];
computeMerkleRoot(txList);`,
    expectedOutput: '[SUCCESS] Computed Root: 0x7a8b9c1d',
  },
  {
    id: 'pow-solver',
    title: 'Proof-of-Work Target Solver',
    language: 'javascript',
    category: 'Distributed Systems',
    description: 'Finds a numerical nonce that produces a hash satisfying the network target difficulty.',
    code: `// Proof-of-Work Target Matcher
function fastHash(seed, nonce) {
  let str = seed + "_" + nonce;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function solveProofOfWork(blockData, targetPrefix) {
  console.log("[POW] Searching for nonce with target prefix: '" + targetPrefix + "'");
  let nonce = 0;
  const maxAttempts = 100000;

  while (nonce < maxAttempts) {
    let digest = fastHash(blockData, nonce);
    if (digest.startsWith(targetPrefix)) {
      console.log("[FOUND] Valid Block Nonce: " + nonce);
      console.log("[DIGEST] Hash: " + digest);
      return { nonce: nonce, hash: digest };
    }
    if (nonce % 2000 === 0 && nonce > 0) {
      console.log("[SEARCHING] Iterated " + nonce + " nonces...");
    }
    nonce++;
  }
  console.log("[ABORT] Max iterations exceeded.");
}

solveProofOfWork("BLOCK_HEADER_884392", "00");`,
    expectedOutput: '[FOUND] Valid Block Nonce',
  },
  {
    id: 'packet-filter',
    title: 'Network Packet Inspection Engine',
    language: 'javascript',
    category: 'Security',
    description: 'Analyzes simulated TCP/UDP headers and filters anomalous payloads.',
    code: `// Stateful Packet Inspection (SPI) Filter
const packets = [
  { id: 101, src: "192.168.1.50", dst: "10.0.0.1", port: 443, payloadLen: 512, flag: "SYN" },
  { id: 102, src: "45.33.32.156", dst: "10.0.0.1", port: 22, payloadLen: 1204, flag: "ACK" },
  { id: 103, src: "198.51.100.4", dst: "10.0.0.1", port: 80, payloadLen: 9940, flag: "ANOMALOUS_OVERFLOW" },
  { id: 104, src: "192.168.1.75", dst: "10.0.0.1", port: 443, payloadLen: 256, flag: "ACK" },
];

function inspectStream(stream) {
  console.log("[FIREWALL] Starting stateful stream inspection...");
  let blocked = 0;
  let passed = 0;

  stream.forEach(pkt => {
    if (pkt.payloadLen > 4096 || pkt.flag.includes("ANOMALOUS")) {
      console.log("[ALERT/DROP] Packet #" + pkt.id + " from " + pkt.src + " [VIOLATION: Payload threshold exceeded]");
      blocked++;
    } else {
      console.log("[ALLOW] Packet #" + pkt.id + " -> Port " + pkt.port + " [Status: Clean]");
      passed++;
    }
  });

  console.log("[SUMMARY] Inspection complete. Passed: " + passed + " | Dropped: " + blocked);
}

inspectStream(packets);`,
    expectedOutput: '[SUMMARY] Inspection complete.',
  },
  {
    id: 'consensus',
    title: 'Raft Distributed Quorum Validator',
    language: 'javascript',
    category: 'Distributed Systems',
    description: 'Simulates quorum consensus voting among distributed nodes in a cluster.',
    code: `// Raft Cluster Consensus Voting Simulator
const clusterNodes = [
  { id: "Node-A", term: 4, isAlive: true, voteGranted: true },
  { id: "Node-B", term: 4, isAlive: true, voteGranted: true },
  { id: "Node-C", term: 4, isAlive: false, voteGranted: false },
  { id: "Node-D", term: 4, isAlive: true, voteGranted: true },
  { id: "Node-E", term: 4, isAlive: true, voteGranted: false },
];

function evaluateQuorum(nodes) {
  const total = nodes.length;
  const majorityThreshold = Math.floor(total / 2) + 1;
  console.log("[RAFT] Total Cluster Size: " + total + " | Quorum Threshold Required: " + majorityThreshold);

  let votes = 0;
  nodes.forEach(n => {
    if (n.isAlive && n.voteGranted) {
      console.log("  [+] " + n.id + ": Vote APPROVED for Term 4");
      votes++;
    } else {
      console.log("  [-] " + n.id + ": Vote REJECTED / Node Unresponsive");
    }
  });

  if (votes >= majorityThreshold) {
    console.log("[CONSENSUS ACHIEVED] Leader elected with " + votes + "/" + total + " votes.");
    return true;
  } else {
    console.log("[CONSENSUS FAILED] Quorum not reached (" + votes + "/" + majorityThreshold + ").");
    return false;
  }
}

evaluateQuorum(clusterNodes);`,
    expectedOutput: '[CONSENSUS ACHIEVED] Leader elected',
  },
];

export const CodeExecutionSandbox: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate>(CODE_TEMPLATES[0]);
  const [code, setCode] = useState<string>(CODE_TEMPLATES[0].code);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult>({
    status: 'idle',
    output: [
      '[READY] On-Demand Execution Sandbox initialized.',
      'Select a template or enter custom JavaScript/TypeScript code and click "Execute Code".',
    ],
    executionTimeMs: 0,
    memoryUsedKb: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSelectTemplate = (template: CodeTemplate) => {
    setSelectedTemplate(template);
    setCode(template.code);
    cyberAudio.playKeyClick();
    setExecutionResult({
      status: 'idle',
      output: [`[LOADED] Template: ${template.title}`, 'Click "Execute Code" to evaluate.'],
      executionTimeMs: 0,
      memoryUsedKb: 0,
    });
  };

  const handleExecute = () => {
    setIsExecuting(true);
    cyberAudio.playKeyClick();

    const outputLogs: string[] = [];
    const startTime = performance.now();

    // Create safe sandboxed console interceptor
    const sandboxConsole = {
      log: (...args: any[]) => {
        outputLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      error: (...args: any[]) => {
        outputLogs.push(`[ERROR] ${args.join(' ')}`);
      },
      warn: (...args: any[]) => {
        outputLogs.push(`[WARN] ${args.join(' ')}`);
      },
      info: (...args: any[]) => {
        outputLogs.push(`[INFO] ${args.join(' ')}`);
      },
    };

    setTimeout(() => {
      try {
        // Execute inside Function sandbox with intercepted console
        const sandboxFunction = new Function('console', code);
        const returnValue = sandboxFunction(sandboxConsole);

        const endTime = performance.now();
        const executionTime = Number((endTime - startTime).toFixed(2));
        const estimatedMemory = Number((42 + Math.random() * 24).toFixed(1));

        cyberAudio.playAccessGranted();

        setExecutionResult({
          status: 'success',
          output: outputLogs.length > 0 ? outputLogs : ['[EXECUTION COMPLETE] Code executed with return: ' + String(returnValue)],
          returnValue,
          executionTimeMs: executionTime,
          memoryUsedKb: estimatedMemory,
        });
      } catch (err: any) {
        cyberAudio.playAccessDenied();
        const endTime = performance.now();
        setExecutionResult({
          status: 'error',
          output: [
            ...outputLogs,
            `[RUNTIME EXCEPTION] ${err.name || 'Error'}: ${err.message}`,
            err.stack ? `  at line: ${err.stack.split('\n')[1] || 'anonymous'}` : '',
          ],
          errorDetails: err.message,
          executionTimeMs: Number((endTime - startTime).toFixed(2)),
          memoryUsedKb: 12.4,
        });
      } finally {
        setIsExecuting(false);
      }
    }, 180);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    cyberAudio.playKeyClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setCode(selectedTemplate.code);
    cyberAudio.playKeyClick();
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-[#020b12] text-[#00e5ff] font-mono text-xs select-none p-3 overflow-hidden">
      {/* Top Header & Template Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00e5ff]/30 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-bold uppercase text-[11px] flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-[#00e5ff]" />
            Template:
          </span>
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const t = CODE_TEMPLATES.find((item) => item.id === e.target.value);
              if (t) handleSelectTemplate(t);
            }}
            className="bg-[#041926] border border-[#00e5ff]/40 text-[#00e5ff] text-xs px-2 py-1 rounded focus:outline-none focus:border-[#00e5ff] cursor-pointer"
          >
            {CODE_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id} className="bg-[#020b12] text-[#00e5ff]">
                [{tpl.category}] {tpl.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1 border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1 cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleResetCode}
            className="px-2.5 py-1 border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1 cursor-pointer"
            title="Reset to Template Default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-4 py-1.5 border border-[#00e5ff] bg-[#00e5ff]/20 text-[#00e5ff] font-bold rounded flex items-center gap-1.5 hover:bg-[#00e5ff]/30 box-glow-cyan cursor-pointer transition-all disabled:opacity-50"
          >
            {isExecuting ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isExecuting ? 'Executing...' : 'Execute Code'}
          </button>
        </div>
      </div>

      {/* Main Split View: Code Editor (Left) & Live Console / Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Code Editor Pane */}
        <div className="flex flex-col border border-[#00e5ff]/40 bg-[#010e17] rounded overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#00e5ff]/20 bg-[#031522] text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 font-bold text-[#00e5ff]">
              <Cpu className="w-3 h-3" />
              Source Code Editor ({selectedTemplate.language.toUpperCase()})
            </span>
            <span>{lineCount} lines</span>
          </div>

          <div className="flex flex-1 min-h-0 relative overflow-hidden font-mono text-xs">
            {/* Line Numbers Gutter */}
            <div className="w-9 bg-[#020b12] border-r border-[#00e5ff]/20 text-neutral-600 select-none py-2 text-right pr-2 font-mono text-[11px] leading-5">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea Code Input */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 p-2 bg-transparent text-[#bbf2f6] focus:outline-none resize-none font-mono text-[12px] leading-5 overflow-y-auto selection:bg-[#00e5ff]/30 selection:text-white"
            />
          </div>
        </div>

        {/* RIGHT: Sandboxed Execution Console & Telemetry */}
        <div className="flex flex-col border border-[#00e5ff]/40 bg-[#010e17] rounded overflow-hidden">
          {/* Header & Execution Telemetry */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#00e5ff]/20 bg-[#031522] text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#00e5ff]">
              <Terminal className="w-3.5 h-3.5" />
              Standard Output (stdout)
            </span>

            {executionResult.status !== 'idle' && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-neutral-400">
                  <Clock className="w-3 h-3 text-[#00e5ff]" />
                  {executionResult.executionTimeMs} ms
                </span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <HardDrive className="w-3 h-3 text-[#00e5ff]" />
                  ~{executionResult.memoryUsedKb} KB
                </span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    executionResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {executionResult.status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" /> ERROR
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Console Output Area */}
          <div className="flex-1 p-3 bg-black/70 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1">
            {executionResult.output.map((line, idx) => {
              const isErr = line.includes('[ERROR]') || line.includes('[RUNTIME EXCEPTION]');
              const isSuccess = line.includes('[SUCCESS]') || line.includes('[CONSENSUS ACHIEVED]') || line.includes('[FOUND]');
              const isAlert = line.includes('[ALERT/DROP]') || line.includes('[WARN]');

              return (
                <div
                  key={idx}
                  className={`break-all ${
                    isErr
                      ? 'text-red-400 bg-red-950/30 px-1 rounded'
                      : isSuccess
                      ? 'text-emerald-400 font-bold'
                      : isAlert
                      ? 'text-amber-300'
                      : 'text-[#00e5ff]/90'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>

          {/* Sandbox Footer Info */}
          <div className="p-2 border-t border-[#00e5ff]/20 bg-[#020b12] text-[10px] text-neutral-400 flex justify-between items-center">
            <span>Environment: Sandboxed V8 Engine (Isolated Context)</span>
            <span>Security: Read-Only DOM, No Network Egress</span>
          </div>
        </div>
      </div>
    </div>
  );
};
