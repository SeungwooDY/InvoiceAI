import { NextRequest, NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code are required" },
        { status: 400 }
      );
    }

    const stored = global.otpStore!.get(phone);

    if (!stored) {
      return NextResponse.json(
        { error: "No OTP found for this number. Request a new one.", verified: false },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      global.otpStore!.delete(phone);
      return NextResponse.json(
        { error: "OTP has expired. Request a new one.", verified: false },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: "Invalid code", verified: false },
        { status: 400 }
      );
    }

    // OTP verified — clean up
    global.otpStore!.delete(phone);

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify OTP", verified: false },
      { status: 500 }
    );
  }
}
