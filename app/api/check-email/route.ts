// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendOtpcodeEmail } from "@/lib/mail";

// Admin credentials
const ADMINS = [
  {
    email: 'aggi@scintl.co.ug',
    name: 'Mark Kimbugwe',
    phone: '0703634786',
    role: 'requester'
  },
  {
    email: 'alebarkm@gmail.com',
    name: 'Alebar Kanyonza',
    phone: '+256778107764',
    role: 'approver'
  }
];

const ADMIN_PIN = process.env.ADMIN_PIN || '123456';

const CheckEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// This route checks if an email exists in the database and sends an OTP if it does
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

    // Check if email belongs to any admin
    const admin = ADMINS.find(admin => admin.email.toLowerCase() === email.toLowerCase());
    
    if (admin) {
      console.log(`Admin login attempt for ${email} (${admin.name})`);
      console.log(`Admin PIN: ${ADMIN_PIN}`);
      await sendOtpcodeEmail(email, ADMIN_PIN, admin.name);
      
      return NextResponse.json({
        status: true,
        exists: true,
        isAdmin: true,
        adminRole: admin.role,
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
        isAdmin: false,
        message: "OTP sent to your email",
      });
    } else {
      return NextResponse.json({
        status: true,
        exists: false,
        isAdmin: false,
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