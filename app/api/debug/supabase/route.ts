import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  const results: Record<string, unknown> = {
    session: session
      ? {
          userId: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          ...(session.user as Record<string, unknown>),
        }
      : null,
    envCheck: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    },
  };

  try {
    const supabase = createServiceClient();

    // Test 1: Can we query the users table?
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, provider")
      .limit(5);

    results.usersQuery = { data: users, error: usersError };

    // Test 2: Can we query the organizations table?
    const { data: orgs, error: orgsError } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(5);

    results.orgsQuery = { data: orgs, error: orgsError };

    // Test 3: Try inserting a test row and immediately deleting it
    const { data: testInsert, error: insertError } = await supabase
      .from("users")
      .insert({
        email: "test@debug.com",
        provider: "debug-test",
        provider_account_id: "debug-" + Date.now(),
        name: "Debug Test",
        role: "viewer",
      })
      .select("id")
      .single();

    results.insertTest = { data: testInsert, error: insertError };

    // Clean up test row
    if (testInsert?.id) {
      await supabase.from("users").delete().eq("id", testInsert.id);
      // await supabase.schema('api').from('users').delete().eq("id", testInsert.id);
      results.cleanedUp = true;
    }
  } catch (err) {
    results.exception = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}
