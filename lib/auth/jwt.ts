import crypto from 'crypto';

const getSecret = () => {
  return process.env.JWT_SECRET || 'fe51ebdee79c49625e947930d6db2916610145666ad362eb2c27f28612c8a6e7';
};

function base64url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function fromBase64url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

export function signJWT(payload: Record<string, unknown>): string {
  const secret = getSecret();
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const secret = getSecret();
    const signature = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (signature !== parts[2]) return null;

    const payload = JSON.parse(fromBase64url(parts[1]));
    if (payload.exp && Date.now() > (payload.exp as number)) return null;

    return payload;
  } catch {
    return null;
  }
}
