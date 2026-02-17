import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orgName = body.name?.trim();

  if (!orgName) {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    return NextResponse.json(
      { error: "Supabase not configured", details: String(err) },
      { status: 500 }
    );
  }

  const sessionUser = session.user as Record<string, unknown>;
  const userId = session.user.id!;
  const email = session.user.email;
  const provider = (sessionUser.provider as string) || "google";

  // Step 1: Find or create the user in Supabase
  // Try by UUID first
  let dbUser: { id: string; organization_id: string | null } | null = null;

  const { data: byId } = await supabase
    .from("users")
    .select("id, organization_id")
    .eq("id", userId)
    .single();

  if (byId) {
    dbUser = byId;
  } else {
    // Try by provider + email
    if (email) {
      const { data: byEmail } = await supabase
        .from("users")
        .select("id, organization_id")
        .eq("provider", provider)
        .eq("email", email)
        .single();
      if (byEmail) dbUser = byEmail;
    }

    // Still not found — create the user
    if (!dbUser) {
      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          email: email || null,
          name: session.user.name || null,
          avatar_url: session.user.image || null,
          provider,
          provider_account_id: userId,
          role: "viewer",
        })
        .select("id, organization_id")
        .single();

      if (insertErr) {
        return NextResponse.json(
          {
            error: "Failed to create user in database",
            details: insertErr.message,
            code: insertErr.code,
            hint: insertErr.hint,
            sessionInfo: { userId, email, provider },
          },
          { status: 500 }
        );
      }
      dbUser = newUser;
    }
  }

  // Check against DB (not the stale session) if user already has an org
  if (dbUser?.organization_id) {
    return NextResponse.json(
      { error: "You already belong to an organization" },
      { status: 400 }
    );
  }

  // Step 2: Create the organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName })
    .select("id, name")
    .single();

  if (orgError || !org) {
    return NextResponse.json(
      {
        error: "Failed to create organization",
        details: orgError?.message,
        code: orgError?.code,
      },
      { status: 500 }
    );
  }

  // Step 3: Update the user to be finance_manager of this org
  const { error: userError } = await supabase
    .from("users")
    .update({
      organization_id: org.id,
      role: "finance_manager",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dbUser!.id);

  if (userError) {
    await supabase.from("organizations").delete().eq("id", org.id);
    // await supabase.schema('api').from('organizations').delete().eq("id", org.id);
    return NextResponse.json(
      {
        error: "Failed to assign user to organization",
        details: userError.message,
        code: userError.code,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    organization: org,
    role: "finance_manager",
  });
}
