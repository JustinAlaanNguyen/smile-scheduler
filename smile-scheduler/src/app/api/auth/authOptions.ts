// src/app/api/auth/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getUserByEmail } from "@/../backend/dbHelpers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    console.log("❌ Missing credentials");
    throw new Error("Missing email or password");
  }

  const user = await getUserByEmail(credentials.email);
  if (!user) {
    console.log("❌ No user found");
    throw new Error("No user found");
  }

  if (!user.email_verified) {
    console.log("❌ Email not verified");
    throw new Error("Please verify your email before logging in.");
  }

  const isValid = await compare(credentials.password, user.password);

  console.log(
    `[LOGIN] email=${credentials.email}  match=${isValid} hash_in_db=${user.password.slice(0, 10)}…`
  );

  if (!isValid) {
    console.log("❌ Invalid password");
    throw new Error("Invalid password");
  }

  return { id: String(user.id), email: user.email, name: user.username };
}
,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
