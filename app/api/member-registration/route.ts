// app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendOtpcodeEmail } from "@/lib/mail";
import {
  generateSystemUniqueId,
  getCurrentTimestamp,
  getAccountCategoryCode,
  mapGenderToCode,
  validateNIN,
} from '@/lib/bou-utils';
import { generateReferenceNumber } from '@/services/transaction-service';

const prisma = new PrismaClient();

const RegistrationSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  date_of_birth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  nin_number: z.string()
    .min(14, "NIN must be 14 characters")
    .max(14, "NIN must be 14 characters")
    .refine(val => validateNIN(val), {
      message: "Invalid NIN format. Correct format: CM/CF followed by 9 digits and a letter",
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegistrationSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { email, fullName,date_of_birth,phone_number, nin_number } = parsed.data;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-minute expiry

    // Generate Bank of Uganda required fields
    const referenceNumber = await generateReferenceNumber();
    const systemUniqueId = generateSystemUniqueId();
    const timestamp = getCurrentTimestamp();

    // Create user with all required fields
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        otp,
        otpExpiresAt,
        phone_number,
        
        // Bank of Uganda fields
        reference_number: referenceNumber,
        system_unique_id: systemUniqueId,
        operation_type: 0, // 0 for new account
        transaction_timestamp: timestamp,
        account_id: phone_number,
        account_category_code: getAccountCategoryCode(),
        nin_number,
        date_of_birth: date_of_birth ? new Date(date_of_birth).getTime() : null,
        account_status: 0, // Active by default
      },
    });

    // Send OTP email
    await sendOtpcodeEmail(email, otp, fullName);

    console.log(`Registration OTP for ${email}: ${otp}`);
    console.log(`Bank of Uganda Reference: ${referenceNumber}`);

    return NextResponse.json({
      status: true,
      message: "User registered, OTP sent",
      referenceNumber, // Optional: return reference number to client
    });
  } catch (error: any) {
    console.error("Error in registration:", error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        { error: `${field || 'Field'} already exists` },
        { status: 400 }
      );
    }

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
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}