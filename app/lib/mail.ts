import MagicLogin from "@/components/email/login-pin-code";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "aggipeter25@gmail.com",
    pass: "dvmslnjeullrxoun",
  },
});

export const sendOtpcodeEmail = async (
  email: string,
  otp: string,
  fullName: string
) => {
  try {
    const emailHtml = await render(MagicLogin({ otp, fullName }));
    const mailOptions = {
      from: `"REI Support" <info@scintl.com>`, // Sender name and email
      to: email,
      subject: "REI 25th Login One Time Pin",
      html: emailHtml, // Rendered email content
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};
