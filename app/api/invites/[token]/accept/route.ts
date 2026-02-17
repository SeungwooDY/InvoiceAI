import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";

async function findOrCreateUser(supabase: ReturnType<typeof createServiceClient>, session: { user?: { id?: string; email?: string | null; name?: string | null; image?: string | null } & Record<string, unknown> }) {
  const sessionUser = session.user as Record<string, unknown>;
  const userId = session.user!.id!;
  const email = session.user!.email;
  const provider = (sessionUser.provider as string) || "unknown";

  const { data: byId } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();
  if (byId) return byId;

  if (email) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id")
      .eq("provider", provider)
      .eq("email", email)
      .single();
    if (byEmail) return byEmail;
  }

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      email: email || null,
      name: session.user!.name || null,
      avatar_url: session.user!.image || null,
      provider,
      provider_account_id: userId,
      role: "viewer",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[invite/accept] Failed to auto-create user:", error);
    return null;
  }

  return newUser;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as Record<string, unknown>;
  const currentOrgId = sessionUser.organizationId as string | null;

  if (currentOrgId) {
    return NextResponse.json(
      { error: "You already belong to an organization" },
      { status: 400 }
    );
  }

  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const dbUser = await findOrCreateUser(supabase, session);
  if (!dbUser) {
    return NextResponse.json(
      { error: "Could not create user record. Please try again." },
      { status: 500 }
    );
  }

  // Find the invite
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("id, organization_id, role, email, used_by, expires_at")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
  }

  if (invite.used_by) {
    return NextResponse.json({ error: "Invite has already been used" }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
  }

  if (invite.email) {
    const userEmail = session.user.email?.toLowerCase();
    if (userEmail !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite is for a different email address" },
        { status: 403 }
      );
    }
  }

  const { error: userError } = await supabase
    .from("users")
    .update({
      organization_id: invite.organization_id,
      role: invite.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dbUser.id);

  if (userError) {
    console.error("[invite/accept] Failed to update user:", userError);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  await supabase
    .from("invites")
    .update({ used_by: dbUser.id })
    .eq("id", invite.id);

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", invite.organization_id)
    .single();

  return NextResponse.json({
    organization: org,
    role: invite.role,
  });
}
