const AUTH_COOKIE = 'zortex_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getSecretKey(): string {
  return (
    import.meta.env.ADMIN_JWT_SECRET ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    'zortex-b2b-saas-enterprise-secret-key-2026'
  );
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminSessionToken(user: string): Promise<string> {
  const payload = {
    user,
    role: 'admin',
    exp: Date.now() + SESSION_TTL_MS,
  };
  const enc = new TextEncoder();
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const key = await getHmacKey(getSecretKey());
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = base64UrlEncode(sigBuffer);
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  try {
    const key = await getHmacKey(getSecretKey());
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(sigB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadB64)
    );
    if (!valid) return false;

    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(base64UrlDecode(payloadB64)));
    if (!payload.exp || payload.exp < Date.now()) return false;
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export function isAuthorizedRequest(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization') || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`));
    if (match) token = decodeURIComponent(match[1]);
  }
  return verifyAdminSessionToken(token);
}

export { AUTH_COOKIE };
