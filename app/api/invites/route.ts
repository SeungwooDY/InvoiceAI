import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as Record<string, unknown>;
  const role = sessionUser.role as string;
  const organizationId = sessionUser.organizationId as string | null;

  if (role !== "finance_manager" || !organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data: invites, error } = await supabase
    .from("invites")
    .select("id, role, email, token, expires_at, created_at, used_by")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }

  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sessionUser = session.user as Record<string, unknown>;
  const role = sessionUser.role as string;
  const organizationId = sessionUser.organizationId as string | null;

  if (role !== "finance_manager" || !organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const inviteRole = body.role;
  const email = body.email?.trim().toLowerCase() || null;
  const expiresInDays = body.expiresInDays || 7;

  if (!inviteRole || !["finance_manager", "approver"].includes(inviteRole)) {
    return NextResponse.json(
      { error: "Role must be finance_manager or approver" },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const supabase = createServiceClient();

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      organization_id: organizationId,
      role: inviteRole,
      email,
      token,
      invited_by: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, role, email, token, expires_at, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  return NextResponse.json({ invite });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as Record<string, unknown>;
  const role = sessionUser.role as string;
  const organizationId = sessionUser.organizationId as string | null;

  if (role !== "finance_manager" || !organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get("id");

  if (!inviteId) {
    return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .eq("organization_id", organizationId)
    .is("used_by", null);

  if (error) {
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
