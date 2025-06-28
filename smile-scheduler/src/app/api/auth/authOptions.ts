// src/app/api/auth/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getUserByEmail } from "@/../backend/dbHelpers";

/* ──────────────────────────────────────────────────────────────
 * NextAuth configuration
 * ----------------------------------------------------------------
 * Uses credential‑based auth that:
 *   1. Looks up the user by e‑mail
 *   2. Verifies the e‑mail is confirmed
 *   3. Compares the supplied password against the bcrypt hash
 * Returns a minimal JWT payload: { id, email, name }
 * ──────────────────────────────────────────────────────────── */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Guard against missing form fields
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 1. Fetch user record
        const user = await getUserByEmail(credentials.email);
        if (!user) throw new Error("No user found");

        // 2. Ensure the user has verified their e‑mail
        if (!user.email_verified)
          throw new Error("Please verify your email before logging in.");

        // 3. Validate password
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        // 4. Return the JWT payload (NextAuth attaches this to `token.user`)
        return { id: String(user.id), email: user.email, name: user.username };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages:   { signIn: "/login" },
  secret:  process.env.NEXTAUTH_SECRET,
};
