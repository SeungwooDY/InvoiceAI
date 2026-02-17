import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        // Verify OTP via internal API
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

        // Mock demo users
        const mockUsers: Record<
          string,
          { password: string; id: string; name: string; role: string; companyId: string }
        > = {
          "fm@acme.com": {
            password: "demo",
            id: "1",
            name: "Sarah Chen",
            role: "finance_manager",
            companyId: "acme-corp",
          },
          "approver@acme.com": {
            password: "demo",
            id: "2",
            name: "Michael Ross",
            role: "approver",
            companyId: "acme-corp",
          },
          "viewer@acme.com": {
            password: "demo",
            id: "3",
            name: "Emily Zhang",
            role: "viewer",
            companyId: "acme-corp",
          },
        };

        const user = mockUsers[email];
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
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role as string || "viewer";
        token.companyId = (user as Record<string, unknown>).companyId as string || "default";
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role || "viewer";
        (session.user as unknown as Record<string, unknown>).companyId = token.companyId || "default";
      }
      return session;
    },
  },
});
