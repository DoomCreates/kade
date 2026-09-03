import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSessionToken, SESSION_TTL_SECONDS } from "../../../lib/session";
import { isLocked, recordFailure, recordSuccess } from "../../../lib/authThrottle";

function safeCompare(a, b) {
  const bufA = crypto.createHash("sha256").update(String(a)).digest();
  const bufB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request) {
  const body = await request.json();
  const { step, phrase } = body;

  const first = process.env.FIRST_SECRET;
  const second = process.env.SECOND_SECRET;

  if (!first || !second || !process.env.VAULT_SESSION_TOKEN) {
    return NextResponse.json(
      { error: "Server auth not configured" },
      { status: 500 }
    );
  }

  const lockStatus = await isLocked();
  if (lockStatus.locked) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${lockStatus.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  if (step === 1) {
    if (!safeCompare(phrase || "", first)) {
      await recordFailure();
      return NextResponse.json({ error: "Incorrect phrase." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, nextStep: 2 });
  }

  if (step === 2) {
    if (!safeCompare(phrase || "", second)) {
      await recordFailure();
      return NextResponse.json({ error: "Incorrect phrase." }, { status: 401 });
    }

    await recordSuccess();

    const res = NextResponse.json({ ok: true, unlocked: true });
    res.cookies.set("vault_session", createSessionToken(), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid step." }, { status: 400 });
}
