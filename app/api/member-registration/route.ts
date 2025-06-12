// app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendOtpcodeEmail } from "@/lib/mail";

const prisma = new PrismaClient();

const RegistrationSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1, "Full name is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, fullName } = parsed.data;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-minute expiry

    // Create user in database
    const user = await prisma.user.create({
      data: { email, fullName, otp, otpExpiresAt },
    });

    // Send OTP email
    await sendOtpcodeEmail(email, otp, fullName);

    console.log(`Registration OTP for ${email}: ${otp}`);
    return NextResponse.json({
      status: true,
      message: "User registered, OTP sent",
    });
  } catch (error) {
    console.error("Error in registration:", error);

    // Handle case where email sending fails but user was created
    if (error instanceof Error && error.message.includes("user creation")) {
      return NextResponse.json(
        {
          status: true,
          message: "User registered but OTP email failed to send",
          error: "Email delivery failed",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
