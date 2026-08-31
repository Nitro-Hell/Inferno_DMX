// Cryptographic Hashing Utilities (Double SHA-256 and Hex Formatting)

export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Bitcoin double SHA-256: SHA256(SHA256(header))
export async function doubleSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const firstHashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const secondHashBuffer = await crypto.subtle.digest('SHA-256', firstHashBuffer);
  const hashArray = Array.from(new Uint8Array(secondHashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous fast SHA-256 simulation for high-frequency mining tick loops
export function fastSimulatedHash(input: string, nonce: number): string {
  let hash = 0x811c9dc5;
  const str = input + nonce.toString(16);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  const h2 = ((hash * 31) >>> 0).toString(16).padStart(8, '0');
  const h3 = ((hash * 127) >>> 0).toString(16).padStart(8, '0');
  const h4 = ((hash * 8191) >>> 0).toString(16).padStart(8, '0');
  const h5 = ((hash * 131071) >>> 0).toString(16).padStart(8, '0');
  const h6 = ((hash * 524287) >>> 0).toString(16).padStart(8, '0');
  const h7 = ((hash * 2147483647) >>> 0).toString(16).padStart(8, '0');
  const h8 = ((hash ^ 0xabcdef01) >>> 0).toString(16).padStart(8, '0');
  return h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8;
}

export function formatHashrate(th: number): string {
  if (th >= 1000) {
    return `${(th / 1000).toFixed(2)} EH/s`;
  }
  return `${th.toFixed(1)} TH/s`;
}
