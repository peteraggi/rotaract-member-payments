// app/api/resend-otp/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpcodeEmail } from "@/lib/mail";
import { z } from "zod";

const ResendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    // Check if admin
    if (email === process.env.ADMIN_EMAIL) {
      await sendOtpcodeEmail(email, process.env.ADMIN_PIN || '123456', "Admin User");
      return NextResponse.json({
        status: true,
        message: "Admin PIN resent to your email",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        status: false,
        error: "Email not found",
      }, { status: 404 });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send new OTP email
    await sendOtpcodeEmail(email, otp, user.fullName);

    return NextResponse.json({
      status: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in resend-otp route:", error);
    return NextResponse.json(
      { status: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}