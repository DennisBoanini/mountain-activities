import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = process.env.AUTH_SECRET;

if (!SECRET) {
  // In dev puoi anche lasciarlo di default, ma in produzione DEVE essere impostato.
  // Usiamo una stringa fissa per evitare crash in fase di build.
  // eslint-disable-next-line no-console
  console.warn("AUTH_SECRET non impostato, uso un valore di default SOLO per sviluppo.");
}

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  const secret = SECRET || "dev-secret-change-me";
  return encoder.encode(secret);
}

export type SessionPayload = JWTPayload & {
  sub: string;
  username: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as SessionPayload;
}
