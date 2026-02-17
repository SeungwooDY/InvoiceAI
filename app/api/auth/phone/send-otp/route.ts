import { NextRequest, NextResponse } from "next/server";

// In-memory OTP store (production: use Redis or DB)
// Shared across routes via global scope
declare global {
  // eslint-disable-next-line no-var
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    global.otpStore!.set(phone, { code, expiresAt });

    // Placeholder: In production, send via Twilio
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: `Your PayFlow verification code is: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });

    console.log(`[OTP] Code for ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch {
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
