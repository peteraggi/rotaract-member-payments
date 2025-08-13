
// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendOtpcodeEmail } from "@/lib/mail";

// Hardcoded admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aggi@scintl.co.ug';
const ADMIN_PIN = process.env.ADMIN_PIN || '123456';

const CheckEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CheckEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    if (email === ADMIN_EMAIL) {
      console.log(`Admin login attempt for ${email}`);
      console.log(`Admin PIN: ${ADMIN_PIN}`);
      await sendOtpcodeEmail(email, ADMIN_PIN, "Admin User");
      
      return NextResponse.json({
        status: true,
        exists: true,
        message: "Admin PIN sent to your email",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      await prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt },
      });

      console.log(`OTP for ${email}: ${otp}`);
      await sendOtpcodeEmail(email, otp, user.fullName);
      
      return NextResponse.json({
        status: true,
        exists: true,
        message: "OTP sent to your email",
      });
    } else {
      return NextResponse.json({
        status: true,
        exists: false,
        message: "Email not found",
      });
    }
  } catch (error) {
    console.error("Error in check-email route:", error);
    return NextResponse.json(
      { status: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}