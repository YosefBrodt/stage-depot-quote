// Web Crypto only, so this works in both the Edge middleware and Node routes.

const COOKIE_NAME = "sd_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET env var must be set (32+ chars recommended)");
  }
  return s;
}

const enc = new TextEncoder();

let cachedKey: { secret: string; key: CryptoKey } | null = null;
async function getKey(): Promise<CryptoKey> {
  const secret = getSecret();
  if (cachedKey && cachedKey.secret === secret) return cachedKey.key;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  cachedKey = { secret, key };
  return key;
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${bytesToBase64Url(sig)}`;
}

async function verify(token: string): Promise<string | null> {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const payload = token.slice(0, idx);
  const macB64 = token.slice(idx + 1);
  let mac: Uint8Array;
  try {
    mac = base64UrlToBytes(macB64);
  } catch {
    return null;
  }
  const key = await getKey();
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    mac as unknown as BufferSource,
    enc.encode(payload)
  );
  return ok ? payload : null;
}

export type SessionPayload = { iat: number; exp: number };

export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_DAYS * 24 * 60 * 60,
  };
  const encoded = bytesToBase64Url(enc.encode(JSON.stringify(payload)));
  return await sign(encoded);
}

export async function isValidSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const payload = await verify(token);
  if (!payload) return false;
  try {
    const bytes = base64UrlToBytes(payload);
    const text = new TextDecoder().decode(bytes);
    const data = JSON.parse(text) as SessionPayload;
    if (typeof data.exp !== "number") return false;
    return data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  if (expected.length !== input.length) return false;
  // Constant-time compare in plain JS.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
