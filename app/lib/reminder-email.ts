// lib/mail.ts
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import PaymentConfirmation from "@/components/email/PaymentConfirmation";
import PaymentReminder from "@/components/email/PaymentReminder";

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "rotaractearthinitiativeclub@gmail.com",
    pass: "mntosnurouzeeerp",
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

export const sendPaymentReminderEmail = async (
  email: string,
  fullName: string,
  amountPaid: number,
  balanceDue: number
) => {
  try {
    const emailHtml = await render(
      PaymentReminder({
        fullName,
        amountPaid,
        balanceDue,
      })
    );

    const mailOptions = {
      from: `"REI Conference" <rotaractearthinitiativeclub@gmail.com>`,
      to: email,
      subject: "Reminder: Complete Your REI Conference Payment",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment reminder sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending payment reminder email:", error);
    throw error;
  }
};