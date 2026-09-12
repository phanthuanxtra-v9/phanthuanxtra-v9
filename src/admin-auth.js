const TOKEN_TTL_SECONDS = 60 * 60;
const textEncoder = new TextEncoder();

function unauthorized() {
  return { ok: false, reason: "invalid_or_expired_token" };
}

async function keyFromSecret(secret) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function signingSecret(env) {
  return String(env.ADMIN_TOKEN || env.ADMIN_PASSWORD || "");
}

export async function issueAdminToken(env) {
  const secret = signingSecret(env);
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const payload = `${exp}.${nonce}`;
  const key = await keyFromSecret(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return `ptx1.${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(request, env) {
  const secret = signingSecret(env);
  const header = String(request.headers.get("Authorization") || "");
  if (!secret || !/^Bearer\s+\S+$/i.test(header)) return unauthorized();
  const token = header.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "ptx1") return unauthorized();
  const exp = Number(parts[1]);
  const nonce = parts[2];
  if (!Number.isSafeInteger(exp) || exp <= Math.floor(Date.now() / 1000) || !/^[a-f0-9]{32}$/i.test(nonce)) return unauthorized();
  let signature;
  try {
    signature = fromBase64Url(parts[3]);
  } catch {
    return unauthorized();
  }
  if (signature.length !== 32) return unauthorized();
  const key = await keyFromSecret(secret);
  const valid = await crypto.subtle.verify("HMAC", key, signature, textEncoder.encode(`${exp}.${nonce}`));
  return valid ? { ok: true, exp } : unauthorized();
}