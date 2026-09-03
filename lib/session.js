import crypto from "crypto";

export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret() {
  const secret = process.env.VAULT_SESSION_TOKEN;
  if (!secret) throw new Error("VAULT_SESSION_TOKEN not configured");
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  let sigBuf, expBuf;
  try {
    sigBuf = Buffer.from(signature, "hex");
    expBuf = Buffer.from(sign(payload), "hex");
  } catch {
    return false;
  }
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  const exp = parseInt(payload, 10);
  if (!Number.isFinite(exp)) return false;
  return Date.now() / 1000 <= exp;
}

export function checkSession(request) {
  const cookie = request.cookies.get("vault_session");
  if (!cookie) return false;
  try {
    return verifySessionToken(cookie.value);
  } catch {
    return false;
  }
}
