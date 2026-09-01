import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { step, phrase } = body;

  const first = process.env.FIRST_SECRET;
  const second = process.env.SECOND_SECRET;
  const sessionToken = process.env.VAULT_SESSION_TOKEN;

  if (!first || !second || !sessionToken) {
    return NextResponse.json(
      { error: "Server auth not configured" },
      { status: 500 }
    );
  }

  if (step === 1) {
    if (phrase !== first) {
      return NextResponse.json(
        { error: "Incorrect first phrase." },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true, nextStep: 2 });
  }

  if (step === 2) {
    if (phrase !== second) {
      return NextResponse.json(
        { error: "Incorrect second phrase." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true, unlocked: true });
    res.cookies.set("vault_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/"
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid step." }, { status: 400 });
}
