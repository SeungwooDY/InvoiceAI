import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") || "/app/dashboard";

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const sessionUser = session.user as Record<string, unknown>;
  const userId = session.user.id;
  const email = session.user.email;

  // Fetch fresh user data from Supabase
  let freshRole = sessionUser.role as string || "viewer";
  let freshOrgId = sessionUser.organizationId as string | null;

  try {
    const supabase = createServiceClient();
    let freshUser = null;

    if (userId) {
      const { data } = await supabase
        .from("users")
        .select("id, role, organization_id")
        .eq("id", userId)
        .single();
      freshUser = data;
    }

    if (!freshUser && email) {
      const { data } = await supabase
        .from("users")
        .select("id, role, organization_id")
        .eq("email", email)
        .limit(1)
        .single();
      freshUser = data;
    }

    if (freshUser) {
      freshRole = freshUser.role;
      freshOrgId = freshUser.organization_id;
    }
  } catch (err) {
    console.error("[refresh-session] Failed to fetch user:", err);
  }

  // Build updated JWT token payload
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const token = {
    sub: session.user.id,
    name: session.user.name,
    email: session.user.email,
    picture: session.user.image,
    userId: userId,
    role: freshRole,
    organizationId: freshOrgId,
    provider: sessionUser.provider,
  };

  const encoded = await encode({
    token,
    secret,
    salt: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  response.cookies.set(cookieName, encoded, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
