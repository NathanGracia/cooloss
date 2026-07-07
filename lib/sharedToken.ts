import crypto from 'crypto';

// Token de session partagé entre toutes les apps "-oss" (Blindtoss, Memoss,
// et futures apps). Auto-suffisant : signé par HMAC-SHA256, vérifiable
// localement par chaque app sans appel réseau à cooloss. Le même schéma est
// ré-implémenté en Python côté Memoss (server/shared_auth.py) — si tu changes
// le format ici, réplique le changement là-bas.
//
// Format du token : "<payload base64url>.<hmac hex>"
// payload (JSON, avant encodage) : { uid, username, displayName, isAdmin, avatarFile, exp }

export const SHARED_SESSION_COOKIE = 'nathangracia_session';
export const SHARED_SESSION_DOMAIN = '.nathangracia.com';

// Durée volontairement courte (pas 30 jours) : limite la fenêtre pendant
// laquelle un changement d'admin/avatar/username reste "périmé" dans un
// token déjà émis, sans avoir à construire un vrai système de révocation
// cross-app. Voir la nicety de refresh glissant dans app/api/session/refresh.
export const SHARED_SESSION_DURATION_MS = 48 * 60 * 60 * 1000; // 48h

export interface SharedClaims {
  uid: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  avatarFile: string | null;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SHARED_SESSION_SECRET;
  if (!secret) {
    throw new Error('SHARED_SESSION_SECRET manquant — obligatoire, pas de fallback silencieux.');
  }
  return secret;
}

function base64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function hmac(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
}

export function signSharedToken(claims: Omit<SharedClaims, 'exp'>): string {
  const exp = Date.now() + SHARED_SESSION_DURATION_MS;
  const payload: SharedClaims = { ...claims, exp };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = hmac(payloadB64, getSecret());
  return `${payloadB64}.${signature}`;
}

export function verifySharedToken(token: string | undefined | null): SharedClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  let expected: string;
  try {
    expected = hmac(payloadB64, getSecret());
  } catch {
    return null;
  }

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const claims = JSON.parse(base64urlDecode(payloadB64)) as SharedClaims;
    if (typeof claims.uid !== 'number' || typeof claims.exp !== 'number') return null;
    if (Date.now() > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}
