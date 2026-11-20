import { createEmailTransporter } from "../../config/email.js";
import { escapeHtml } from "./htmlEscape.js";

export const sendVerificationEmail = async ({
  to,
  fullName,
  verificationToken,
}) => {
  const transporter = createEmailTransporter();

  const verificationUrl = new URL("/verify-email", process.env.FRONTEND_URL);

  verificationUrl.searchParams.set("token", verificationToken);

  const safeFullName = escapeHtml(fullName);
  const safeVerificationUrl = escapeHtml(verificationUrl.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify Your EduLearn Account",
    text: `
Hello ${fullName},

Thank you for registering with EduLearn.

Please verify your email address using this link:

${verificationUrl.toString()}

This verification link expires in 15 minutes.

If you did not create this account, you can ignore this email.

EduLearn Team
    `,
    html: `
      <h2>Welcome to EduLearn!</h2>
      <p>Hello ${safeFullName},</p>
      <p>Thank you for registering. Please verify your email address.</p>
      <p>
        <a href="${safeVerificationUrl}">
          Verify Email Address
        </a>
      </p>
      <p>This verification link expires in 15 minutes.</p>
      <p>If you did not create this account, you can ignore this email.</p>
      <p>EduLearn Team</p>
    `,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  fullName,
  resetToken,
}) => {
  const transporter = createEmailTransporter();

  // The frontend reset route is not defined in the current documentation;
  // `/reset-password` is the agreed implementation assumption.
  const resetUrl = new URL("/reset-password", process.env.FRONTEND_URL);
  resetUrl.searchParams.set("token", resetToken);

  const safeFullName = escapeHtml(fullName);
  const safeResetUrl = escapeHtml(resetUrl.toString());

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Your EduLearn Password",
    text: `
Hello ${fullName},

We received a request to reset your EduLearn password.

Please reset your password using this link:

${resetUrl.toString()}

This password reset link expires in 15 minutes and can be used only once.

If you did not request a password reset, you can ignore this email.

EduLearn Team
    `,
    html: `
      <h2>Reset Your EduLearn Password</h2>
      <p>Hello ${safeFullName},</p>
      <p>We received a request to reset your EduLearn password.</p>
      <p>
        <a href="${safeResetUrl}">
          Reset Password
        </a>
      </p>
      <p>This password reset link expires in 15 minutes and can be used only once.</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
      <p>EduLearn Team</p>
    `,
  });
};
