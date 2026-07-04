/**
 * AES-256-GCM symmetric encryption for user API keys.
 *
 * Encrypted format (all hex): `<iv>:<authTag>:<ciphertext>`
 *
 * Key source: process.env.API_KEY_SECRET (must be a 64-char hex string = 32 bytes).
 *
 * Usage:
 *   const cipher = encrypt("sk-my-api-key");
 *   const plain  = decrypt(cipher);  // → "sk-my-api-key"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

// ─── Key Loading ─────────────────────────────────────────────────────────────

function loadKey(): Buffer {
    const secret = process.env.API_KEY_SECRET;

    if (!secret) {
        throw new Error(
            "[Encryption] API_KEY_SECRET is not set. " +
            "Add a 64-character hex string to your .env.local file."
        );
    }

    if (secret.length !== 64) {
        throw new Error(
            `[Encryption] API_KEY_SECRET must be exactly 64 hex characters (32 bytes). ` +
            `Got ${secret.length} characters.`
        );
    }

    return Buffer.from(secret, "hex");
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns `"iv:authTag:ciphertext"` — all hex-encoded.
 * Returns `""` if the input is empty (no-op for blank keys).
 */
export function encrypt(text: string): string {
    if (!text) return "";

    const key = loadKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypts a value produced by `encrypt()`.
 * Returns `""` if the input is empty.
 * Throws on tampered or malformed ciphertext.
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText) return "";

    const parts = encryptedText.split(":");

    if (parts.length !== 3) {
        throw new Error(
            "[Encryption] Invalid encrypted format. Expected 'iv:authTag:ciphertext'."
        );
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;

    const key = loadKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
