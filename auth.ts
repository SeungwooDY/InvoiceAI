import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { createServiceClient } from "@/lib/supabase/server";

// Demo users for local development
const DEMO_USERS: Record<
  string,
  { password: string; id: string; name: string; role: string; companyId: string }
> = {
  "fm@acme.com": {
    password: "demo",
    id: "demo-fm",
    name: "Sarah Chen",
    role: "finance_manager",
    companyId: "acme-corp",
  },
  "approver@acme.com": {
    password: "demo",
    id: "demo-approver",
    name: "Michael Ross",
    role: "approver",
    companyId: "acme-corp",
  },
  "viewer@acme.com": {
    password: "demo",
    id: "demo-viewer",
    name: "Emily Zhang",
    role: "viewer",
    companyId: "acme-corp",
  },
};

const DEMO_ORG_NAME = "Acme Corp";

/**
 * Upsert a user into Supabase and return their DB record.
 * Also stores OAuth tokens in the accounts table.
 */
async function upsertSupabaseUser({
  provider,
  providerAccountId,
  email,
  phone,
  name,
  avatarUrl,
  accessToken,
  refreshToken,
  tokenType,
  scope,
  idToken,
  expiresAt,
}: {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  expiresAt?: number | null;
}) {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    console.error("[auth] Failed to create Supabase client:", err);
    return null;
  }

  // Check if user already exists
  const { data: existing, error: selectErr } = await supabase
    .from("users")
    .select("id, role, organization_id")
    .eq("provider", provider)
    .eq("provider_account_id", providerAccountId)
    .single();

  if (selectErr && selectErr.code !== "PGRST116") {
    // PGRST116 = no rows found, which is expected for new users
    console.error("[auth] Error querying existing user:", selectErr);
  }

  let userId: string;

  if (existing) {
    userId = existing.id;

    // Update profile fields if changed
    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };
    if (name) updates.name = name;
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    await supabase.from("users").update(updates).eq("id", userId);
   // await supabase.schema('api').from('users').update(updates).eq("id", userId);


    // Update OAuth tokens in accounts table
    if (accessToken) {
      await upsertAccount(supabase, userId, {
        provider,
        providerAccountId,
        accessToken,
        refreshToken,
        tokenType,
        scope,
        idToken,
        expiresAt,
      });
    }

    return existing;
  }

  // Check if there's a pending invite for this email
  let role = "viewer";
  let organizationId: string | null = null;

  if (email) {
    const { data: invite } = await supabase
      .from("invites")
      .select("id, organization_id, role")
      .eq("email", email)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single();

    if (invite) {
      role = invite.role;
      organizationId = invite.organization_id;
    }
  }

  // Insert new user
  const { data: newUser, error: insertErr } = await supabase
    .from("users")
    .insert({
      email: email || null,
      phone: phone || null,
      name: name || null,
      avatar_url: avatarUrl || null,
      provider,
      provider_account_id: providerAccountId,
      organization_id: organizationId,
      role,
    })
    .select("id, role, organization_id")
    .single();

  if (insertErr) {
    console.error("[auth] Failed to insert user:", {
      message: insertErr.message,
      code: insertErr.code,
      details: insertErr.details,
      hint: insertErr.hint,
    });
    return null;
  }

  userId = newUser.id;

  // Store OAuth tokens
  if (accessToken) {
    await upsertAccount(supabase, userId, {
      provider,
      providerAccountId,
      accessToken,
      refreshToken,
      tokenType,
      scope,
      idToken,
      expiresAt,
    });
  }

  // Mark invite as used if applicable
  if (email && organizationId) {
    await supabase
      .from("invites")
      .update({ used_by: userId })
      .eq("email", email)
      .eq("organization_id", organizationId)
      .is("used_by", null);
  }

  return newUser;
}

/**
 * Upsert OAuth tokens into the accounts table.
 */
async function upsertAccount(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  tokens: {
    provider: string;
    providerAccountId: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
    scope?: string | null;
    idToken?: string | null;
    expiresAt?: number | null;
  }
) {
  const { error } = await supabase
    .from("accounts")
    .upsert(
      {
        user_id: userId,
        provider: tokens.provider,
        provider_account_id: tokens.providerAccountId,
        access_token: tokens.accessToken || null,
        refresh_token: tokens.refreshToken || null,
        token_type: tokens.tokenType || null,
        scope: tokens.scope || null,
        id_token: tokens.idToken || null,
        expires_at: tokens.expiresAt || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_account_id" }
    );

  if (error) {
    // Non-fatal: tokens are nice-to-have. Log but don't fail the login.
    console.warn("[auth] Failed to upsert account tokens:", error.message);
  }
}

/**
 * Ensure the demo org and demo users exist in Supabase.
 */
async function ensureDemoSetup(demoUser: (typeof DEMO_USERS)[string], email: string) {
  const supabase = createServiceClient();

  let { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", DEMO_ORG_NAME)
    .single();

  if (!org) {
    const { data: newOrg, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: DEMO_ORG_NAME })
      .select("id")
      .single();
    if (orgErr) {
      console.error("[auth] Failed to create demo org:", orgErr);
      return null;
    }
    org = newOrg;
  }

  if (!org) return null;

  const { data: existing } = await supabase
    .from("users")
    .select("id, role, organization_id")
    .eq("provider", "demo-login")
    .eq("provider_account_id", demoUser.id)
    .single();

  if (existing) return existing;

  const { data: newUser, error: userErr } = await supabase
    .from("users")
    .insert({
      email,
      name: demoUser.name,
      provider: "demo-login",
      provider_account_id: demoUser.id,
      organization_id: org.id,
      role: demoUser.role,
    })
    .select("id, role, organization_id")
    .single();

  if (userErr) {
    console.error("[auth] Failed to create demo user:", userErr);
    return null;
  }

  return newUser;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const code = credentials?.code as string;

        if (!phone || !code) return null;

        try {
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
          const res = await fetch(`${baseUrl}/api/auth/phone/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, code }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          if (!data.verified) return null;

          return {
            id: `phone-${phone}`,
            name: phone,
            email: null,
            phone,
          };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: "demo-login",
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.toLowerCase();
        const password = credentials?.password as string;

        const user = DEMO_USERS[email];
        if (!user || user.password !== password) return null;

        return {
          id: user.id,
          email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user && account) {
        const provider = account.provider;

        if (provider === "demo-login") {
          const email = (user.email || "") as string;
          const demoUser = DEMO_USERS[email];
          if (demoUser) {
            try {
              const dbUser = await ensureDemoSetup(demoUser, email);
              if (dbUser) {
                token.userId = dbUser.id;
                token.role = dbUser.role;
                token.organizationId = dbUser.organization_id;
              } else {
                console.warn("[auth] ensureDemoSetup returned null for", email);
                token.role = demoUser.role;
                token.organizationId = null;
              }
            } catch (err) {
              console.error("[auth] ensureDemoSetup error:", err);
              token.role = demoUser.role;
              token.organizationId = null;
            }
          }
        } else {
          // OAuth or phone-otp
          const providerAccountId =
            provider === "phone-otp"
              ? (user as Record<string, unknown>).phone as string || user.id!
              : account.providerAccountId || user.id!;

          console.log("[auth] Upserting user:", {
            provider,
            providerAccountId,
            email: user.email,
            name: user.name,
            hasAccessToken: !!account.access_token,
            hasRefreshToken: !!account.refresh_token,
          });

          try {
            const dbUser = await upsertSupabaseUser({
              provider,
              providerAccountId,
              email: user.email,
              phone: provider === "phone-otp" ? (user as Record<string, unknown>).phone as string : null,
              name: user.name,
              avatarUrl: user.image,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
              expiresAt: account.expires_at,
            });

            if (dbUser) {
              console.log("[auth] User upserted successfully:", { id: dbUser.id, role: dbUser.role, org: dbUser.organization_id });
              token.userId = dbUser.id;
              token.role = dbUser.role;
              token.organizationId = dbUser.organization_id;
            } else {
              console.warn("[auth] upsertSupabaseUser returned null — check errors above");
              token.role = "viewer";
              token.organizationId = null;
            }
          } catch (err) {
            console.error("[auth] upsertSupabaseUser exception:", err);
            token.role = "viewer";
            token.organizationId = null;
          }
        }

        token.provider = provider;
      }

      // On session update (e.g. after org creation), re-fetch role/org from Supabase
      if (trigger === "update") {
        console.log("[auth] Session update triggered, refreshing user data...", {
          userId: token.userId,
          sub: token.sub,
          email: token.email,
        });
        try {
          const supabase = createServiceClient();
          let freshUser = null;

          // Try by userId first
          if (token.userId) {
            const { data } = await supabase
              .from("users")
              .select("id, role, organization_id")
              .eq("id", token.userId as string)
              .single();
            freshUser = data;
          }

          // Fallback: look up by email
          if (!freshUser && token.email) {
            const { data } = await supabase
              .from("users")
              .select("id, role, organization_id")
              .eq("email", token.email as string)
              .limit(1)
              .single();
            freshUser = data;
          }

          if (freshUser) {
            console.log("[auth] Refreshed user data:", freshUser);
            token.userId = freshUser.id;
            token.role = freshUser.role;
            token.organizationId = freshUser.organization_id;
          } else {
            console.warn("[auth] Could not find user during session update");
          }
        } catch (err) {
          console.error("[auth] Failed to refresh user data:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role || "viewer";
        (session.user as unknown as Record<string, unknown>).organizationId = token.organizationId || null;
        (session.user as unknown as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
  },
});
