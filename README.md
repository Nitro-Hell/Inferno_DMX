# Cyber Security Simulation Suite

A high-performance cryptographic and network security simulation workstation built with **React 19**, **TypeScript**, and **Tailwind CSS**. Designed for educational demonstrations, security resilience analysis, and distributed ledger mechanics.

---

## ⚡ Key Modules

### 1. 🔑 Cryptographic Authentication & Hash Collision Analyzer
- **Entropy Search Engine**: Simulates brute-force SHA-512 and PBKDF2 hash collision attacks against authentication endpoints.
- **Target Selection**: Configurable endpoints (Kerberos KDC, OAuth token store, Shadow file partitions).
- **Controls**: Attack velocity adjustment (`Normal`, `Fast`, `Hyper`), active collision matrix visualizer, and instant **Reset** button.

### 2. ⛏️ Bitcoin Proof-of-Work (PoW) & DLT Mining Simulator
- **Double SHA-256 Algorithm**: Live evaluation of `SHA256(SHA256(BlockHeader))` using the Web Crypto API.
- **80-Byte Block Header**: Real-time inspection of Version (`0x20000000`), Previous Hash, Merkle Root, Timestamp, Target Bits (`0x1d00ffff`), and Nonce.
- **Mempool & Merkle Tree**: Dynamic 4-leaf Merkle root calculation from transactions in the memory pool.
- **Target Difficulty Matching**: Adjustable leading zero threshold (`1` to `5` zeros) and ASIC Turbo mode (up to 380 TH/s).
- **Immutable Blockchain Ledger**: Tracks mined block heights, timestamps, solving duration, and accumulated block rewards (3.125 BTC subsidy + transaction fees).

### 3. ✨ Automatic Code Synthesis & Architecture Generator
- **Workflow Scenarios**: Synthesizes high-complexity architectures including:
  - *Byzantine Fault Tolerant (BFT) State Machine Engine* (TypeScript)
  - *Zero-Knowledge Range Proof Verification Circuit* (Rust)
  - *Lock-Free Low-Latency Mempool Processor* (C++)
- **Live Syntax Streaming**: Configurable token generation velocity with animated AST progress indicators.
- **Direct Bridge to Sandbox**: Copy and review synthesized patterns.

### 4. 💻 On-Demand Sandboxed Code Execution Engine
- **In-Browser Sandbox**: Runs JavaScript / TypeScript code in an isolated execution context.
- **Standard Output Interception**: Real-time capture of `console.log`, `console.warn`, and `console.error`.
- **Telemetry Diagnostics**: Accurate execution latency timer (`ms`), estimated memory footprint (`KB`), and exception stack traces.
- **Curated Templates**: Pre-loaded algorithms including Merkle Tree pairwise calculations, PoW target solvers, and Raft distributed consensus quorum validators.

---

## 🛠️ Technology Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Cryptography**: Web Crypto API (`crypto.subtle.digest`)
- **Audio Synthesis**: Non-blocking Web Audio API Oscillator synthesizer
- **Windowing System**: Custom multi-window manager with z-index stacking, minimizing, maximizing, dragging, and automatic 2x2 grid tiling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cyber-security-simulation-suite.git

# Navigate to project directory
cd cyber-security-simulation-suite

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

```bash
# Build static assets
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

1. In `vite.config.ts`, ensure `base` is configured:
   ```ts
   export default defineConfig({
     base: './', // relative paths for GitHub Pages
     plugins: [react()],
   });
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Push dist/ to gh-pages branch or use GitHub Actions
   ```

---

## 📄 License
MIT License. Created for security research and distributed systems education.
