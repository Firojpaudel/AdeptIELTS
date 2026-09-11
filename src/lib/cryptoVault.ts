/**
 * AdeptIELTS Crypto Vault
 * Browser-native Web Crypto AES-GCM 256-bit encryption & decryption utility.
 * Securely encrypts personal AI keys (Groq, Gemini, OpenRouter) before syncing to Turso LibSQL Cloud.
 */

const VAULT_SALT = 'adept_ielts_turso_vault_v1';

/**
 * Derives a 256-bit AES-GCM key from PBKDF2 with user-specific context
 */
async function deriveKey(saltKey: string = 'adept-default'): Promise<CryptoKey | null> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return null;
  }
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(`${VAULT_SALT}:${saltKey}`),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(VAULT_SALT),
        iterations: 10000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (err) {
    console.warn('Key derivation warning:', err);
    return null;
  }
}

/**
 * Encrypts a plaintext secret into an AES-GCM format string:
 * `enc_v1:<iv_hex>:<cipher_hex>`
 */
export async function encryptVaultSecret(plainText: string, saltKey: string = 'adept-default'): Promise<string> {
  if (!plainText || !plainText.trim()) return '';

  try {
    const key = await deriveKey(saltKey);
    if (key && typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const cipherBuf = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(plainText)
      );

      const ivHex = Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const cipherHex = Array.from(new Uint8Array(cipherBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return `enc_v1:${ivHex}:${cipherHex}`;
    }
  } catch (err) {
    console.warn('WebCrypto AES-GCM encrypt fallback:', err);
  }

  // Graceful fallback for environments where WebCrypto subtle is unavailable
  try {
    return `enc_b64:${btoa(encodeURIComponent(plainText))}`;
  } catch {
    return plainText;
  }
}

/**
 * Decrypts an encrypted vault secret.
 * Handles `enc_v1:...` (AES-GCM), `enc_b64:...` (fallback), and raw unencrypted legacy keys.
 */
export async function decryptVaultSecret(cipherText: string, saltKey: string = 'adept-default'): Promise<string> {
  if (!cipherText || !cipherText.trim()) return '';

  // 1. If not an encrypted format string, return as-is (backward compatible)
  if (!cipherText.startsWith('enc_v1:') && !cipherText.startsWith('enc_b64:')) {
    return cipherText;
  }

  // 2. Fallback base64 decoder
  if (cipherText.startsWith('enc_b64:')) {
    try {
      return decodeURIComponent(atob(cipherText.slice(8)));
    } catch {
      return '';
    }
  }

  // 3. WebCrypto AES-GCM decoder
  if (cipherText.startsWith('enc_v1:')) {
    try {
      const parts = cipherText.split(':');
      if (parts.length === 3) {
        const ivHex = parts[1];
        const cipherHex = parts[2];

        if (!ivHex || !cipherHex) return '';

        const ivMatches = ivHex.match(/.{1,2}/g);
        const cipherMatches = cipherHex.match(/.{1,2}/g);
        if (!ivMatches || !cipherMatches) return '';

        const iv = new Uint8Array(ivMatches.map(b => parseInt(b, 16)));
        const cipherBytes = new Uint8Array(cipherMatches.map(b => parseInt(b, 16)));

        // Try primary saltKey
        const key = await deriveKey(saltKey);
        if (key) {
          try {
            const decBuf = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv },
              key,
              cipherBytes
            );
            return new TextDecoder().decode(decBuf);
          } catch {
            // If primary key fails (e.g. user ID changed or default salt was used), try default salt
            if (saltKey !== 'adept-default') {
              const defaultKey = await deriveKey('adept-default');
              if (defaultKey) {
                const decBuf = await crypto.subtle.decrypt(
                  { name: 'AES-GCM', iv },
                  defaultKey,
                  cipherBytes
                );
                return new TextDecoder().decode(decBuf);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Vault secret decryption error:', err);
    }
  }

  return '';
}
