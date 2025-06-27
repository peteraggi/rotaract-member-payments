import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import { User as AuthUser } from "@auth/core/types";

interface User extends AuthUser {
  user_id: number;
  phone_number?: string | null;
  gender?: string | null;
  club_name?: string | null;
  district?: string | null;
  t_shirt_size?: string | null;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jb@gmail.com" },
        pinCode: { label: "pin", type: "string" }, // Changed to string
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.pinCode) {
          throw new Error("Email and PIN are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) throw new Error("User not found");
        if (!user.otp) throw new Error("No PIN generated");
        if (user.otp !== credentials.pinCode) throw new Error("Invalid PIN");
        if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
          throw new Error("PIN has expired");
        }

        await prisma.user.update({
          where: { email: credentials.email as string },
          data: { otp: null, otpExpiresAt: null },
        });

        return {
          id: String(user.user_id),
          email: user.email,
          name: user.fullName || "",
          user_id: user.user_id,
          phone_number: user.phone_number,
          gender: user.gender,
          club_name: user.club_name,
          district: user.district,
          t_shirt_size: user.t_shirt_size,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.user_id = token.user_id as number;
        session.user.phone_number = token.phone_number as string | null;
        session.user.gender = token.gender as string | null;
        session.user.club_name = token.club_name as string | null;
        session.user.district = token.district as string | null;
        session.user.t_shirt_size = token.t_shirt_size as string | null;
        // Dates might need special handling if they're being serialized
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id;
        token.phone_number = user.phone_number;
        token.gender = user.gender;
        token.club_name = user.club_name;
        token.district = user.district;
        token.t_shirt_size = user.t_shirt_size;
        // Add other custom fields to JWT
      }
      return token;
    }
  },
  // Optional: Custom login page
  pages: {
    signIn: "/",
  },
});