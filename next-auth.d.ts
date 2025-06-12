import { User as DefaultUser } from "next-auth";
import { User } from "@prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
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

  interface Session {
    user: User;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends User {}
}