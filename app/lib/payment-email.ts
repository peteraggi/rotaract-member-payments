// lib/mail.ts
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import PaymentConfirmation from "@/components/email/PaymentConfirmation";

// SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kanlyteug@gmail.com",
    pass: "kkcvsaypbtgjwjvx",
  },
});

export const sendPaymentConfirmationEmail = async (
  email: string,
  fullName: string,
  amountPaid: number,
  balance: number,
  totalAmount: number,
  paymentMethod: string,
  transactionId: string
) => {
  try {
    const emailHtml = await render(
      PaymentConfirmation({
        fullName,
        amountPaid,
        balance,
        totalAmount,
        paymentMethod,
        transactionId
      })
    );

    const mailOptions = {
      from: `"REI Conference" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "REI Conference Payment Confirmation",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation sent to ${email}`);
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    throw error;
  }
};