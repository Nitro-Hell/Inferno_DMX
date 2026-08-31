export interface CodeSnippet {
  id: string;
  name: string;
  language: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'kernel-core',
    name: 'Linux Kernel Memory Subsystem',
    language: 'C',
    code: `/* =======================================================
 * Kernel Memory Management Subsystem v6.12-sec
 * Nonce Verification & Page Allocation Buffer
 * ======================================================= */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/slab.h>
#include <linux/mm.h>
#include <crypto/hash.h>

struct sec_context {
    spinlock_t lock;
    void *entropy_pool;
    size_t pool_capacity;
    atomic64_t hash_ops_count;
    unsigned long flags;
};

static int __init initialize_entropy_subsystem(struct sec_context *ctx)
{
    unsigned long pfn;
    struct page *sec_page;
    
    pr_info("[K-SEC] Initializing hardware PRNG security node...\\n");
    spin_lock_init(&ctx->lock);
    
    ctx->entropy_pool = kmalloc(PAGE_SIZE * 16, GFP_KERNEL | __GFP_ZERO);
    if (!ctx->entropy_pool) {
        pr_err("[K-SEC] Fatal: Failed memory allocation for entropy pool\\n");
        return -ENOMEM;
    }
    
    for (pfn = 0; pfn < 16; pfn++) {
        sec_page = virt_to_page((char *)ctx->entropy_pool + (pfn * PAGE_SIZE));
        SetPageReserved(sec_page);
        pr_debug("[K-SEC] Page locked at PFN 0x%08lx\\n", pfn);
    }
    
    atomic64_set(&ctx->hash_ops_count, 0);
    pr_info("[K-SEC] Cryptographic DMA channel online. Status: ARMED\\n");
    return 0;
}

static void audit_stream_integrity(struct sec_context *ctx, const u8 *digest, size_t len)
{
    u64 cycles_start, cycles_end;
    cycles_start = get_cycles();
    
    spin_lock(&ctx->lock);
    for (size_t i = 0; i < len; i++) {
        *((u8 *)ctx->entropy_pool + (i % PAGE_SIZE)) ^= digest[i];
    }
    atomic64_inc(&ctx->hash_ops_count);
    spin_unlock(&ctx->lock);
    
    cycles_end = get_cycles();
    if (cycles_end - cycles_start > 12000) {
        pr_warn("[K-SEC] Latency spike detected during hash pipeline cycle\\n");
    }
}
`
  },
  {
    id: 'crypto-engine',
    name: 'Asymmetric Key Exchange & TLS Handshake',
    language: 'Rust',
    code: `// =======================================================
// Secure Vault Cryptographic Engine - Zero Knowledge Protocol
// Constant-Time Modular Arithmetic
// =======================================================

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Instant;

pub struct SecureKeyRing {
    node_id: u32,
    entropy_bits: [u8; 64],
    nonce_counter: AtomicU64,
    established_routes: Vec<SocketRoute>,
}

impl SecureKeyRing {
    pub fn new(node_id: u32) -> Result<Self, SecEngineError> {
        println!("[CRYPTO-ENGINE] Initializing curve25519 scalar multiplication...");
        let mut entropy = [0u8; 64];
        getrandom::getrandom(&mut entropy).map_err(|_| SecEngineError::EntropyFailure)?;
        
        Ok(Self {
            node_id,
            entropy_bits: entropy,
            nonce_counter: AtomicU64::new(1),
            established_routes: Vec::with_capacity(32),
        })
    }

    pub fn compute_shared_secret(&self, peer_pubkey: &[u8; 32]) -> [u8; 32] {
        let t_start = Instant::now();
        let mut shared_hash = [0u8; 32];
        
        let counter = self.nonce_counter.fetch_add(1, Ordering::SeqCst);
        for idx in 0..32 {
            shared_hash[idx] = self.entropy_bits[idx] ^ peer_pubkey[idx] ^ ((counter & 0xFF) as u8);
        }
        
        println!("[CRYPTO-ENGINE] Secret resolved in {:?}. Vector: 0x{:02x}{:02x}...", 
            t_start.elapsed(), shared_hash[0], shared_hash[1]);
        shared_hash
    }
}
`
  },
  {
    id: 'packet-analyzer',
    name: 'BGP Routing & Threat Telemetry Parser',
    language: 'C++',
    code: `/* =======================================================
 * Advanced Threat Detection & Packet Decapsulation Daemon
 * High-Throughput Ring Buffer Filter
 * ======================================================= */

#include <iostream>
#include <vector>
#include <memory>
#include <chrono>

namespace SecTelemetry {

class PacketCaptureRing {
private:
    uint32_t ring_size;
    std::vector<uint8_t> frame_buffer;
    uint64_t ingested_frames = 0;
    bool promiscuous_mode = true;

public:
    PacketCaptureRing(uint32_t capacity) : ring_size(capacity) {
        frame_buffer.resize(capacity * 1518);
        std::cout << "[TELEMETRY] Memory mapped raw NIC socket [OK]" << std::endl;
        std::cout << "[TELEMETRY] Listening on eth0 promiscuous filter..." << std::endl;
    }

    void parse_frame_headers(const uint8_t* raw_stream, size_t length) {
        if (length < 14) return;
        
        uint16_t ether_type = (raw_stream[12] << 8) | raw_stream[13];
        if (ether_type == 0x0800) { // IPv4
            uint8_t protocol = raw_stream[23];
            uint32_t src_ip = *reinterpret_cast<const uint32_t*>(&raw_stream[26]);
            uint32_t dst_ip = *reinterpret_cast<const uint32_t*>(&raw_stream[30]);
            
            std::cout << "[IP-FLOW] Protocol: " << (int)protocol 
                      << " | Source: " << std::hex << src_ip 
                      << " -> Target: " << dst_ip << std::dec << std::endl;
            ingested_frames++;
        }
    }
};

} // namespace SecTelemetry
`
  }
];
