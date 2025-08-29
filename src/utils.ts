// Utility helpers for the URL shortener CLI.
// - normalizeUrl: ensures a valid URL string; adds https:// if protocol is missing.
// - base62: encodes a bigint to base62 using 0-9a-zA-Z alphabet.
// - genCode: generates a random base62 short code of the given length using crypto RNG.
import crypto from "crypto";

export function normalizeUrl(input: string): string {
    try {
        // Add https if missing
        if (!/^https?:\/\//i.test(input)) input = "https://" + input;
        const u = new URL(input);
        return u.toString();
    } catch {
        throw new Error("Invalid URL");
    }
}

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function base62(n: bigint): string {
    if (n === 0n) return "0";
    let s = "";
    const b = BigInt(ALPHABET.length);
    while (n > 0n) {
        s = ALPHABET[Number(n % b)] + s;
        n /= b;
    }
    return s;
}

export function genCode(len = 6): string {
    // 48 bits → ~8 chars base62, we’ll slice to len
    const buf = crypto.randomBytes(6); // 48 bits
    const n = BigInt("0x" + buf.toString("hex"));
    return base62(n).slice(0, len);
}
