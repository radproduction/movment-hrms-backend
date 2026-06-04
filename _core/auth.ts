import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof db.getUserById>>
>;

type SessionPurpose = "session" | "two_factor";

type SessionPayload = {
  userId: string;
  purpose?: SessionPurpose;
};

function getSessionSecret() {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(
  userId: string,
  options: { expiresInMs?: number; purpose?: SessionPurpose } = {}
): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
  const secretKey = getSessionSecret();
  const purpose: SessionPurpose = options.purpose ?? "session";

  return new SignJWT({ userId, purpose } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string,
  expectedPurpose: SessionPurpose = "session"
) {
  const secretKey = getSessionSecret();
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });

  const userId = typeof payload.userId === "string" ? payload.userId : "";
  if (!userId) {
    throw new Error("Invalid session payload");
  }

  const purpose = (payload as SessionPayload).purpose ?? "session";
  if (purpose !== expectedPurpose) {
    throw new Error("Invalid session purpose");
  }

  return { userId };
}

export function setSessionCookie(
  res: Response,
  req: Request,
  token: string,
  maxAgeMs: number
) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: maxAgeMs });
}

export async function authenticateRequest(req: Request): Promise<AuthenticatedUser> {
  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
  const token = cookies[COOKIE_NAME];

  if (!token) {
    throw new Error("Missing session cookie");
  }

  const { userId } = await verifySessionToken(token, "session");

  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getUserIdFromCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) return null;
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  try {
    const { userId } = await verifySessionToken(token, "session");
    return userId || null;
  } catch {
    return null;
  }
}
