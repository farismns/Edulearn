import {
  createUserWithVerificationToken,
  createResendVerificationToken,
} from "./auth.repository.js";
import { sendVerificationEmail } from "../email/email.service.js";
import { hashPassword } from "../../utils/password.js";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../../utils/verificationToken.js";
import AppError from "../../utils/AppError.js";
import { timingSafeEqual } from "node:crypto";

const VERIFICATION_TOKEN_EXPIRY_MINUTES = 15;

const verifySetupSecret = (providedSecret) => {
  const configuredSecret = process.env.SETUP_SECRET;

  if (!configuredSecret) {
    throw new AppError("Registration is not properly configured.", 500);
  }

  if (typeof providedSecret !== "string") {
    return false;
  }

  const providedBuffer = Buffer.from(providedSecret);
  const configuredBuffer = Buffer.from(configuredSecret);

  if (providedBuffer.length !== configuredBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, configuredBuffer);
};

export const registerUser = async ({
  fullName,
  email,
  password,
  setupSecret,
}) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Production requires a valid Setup Secret.
  if (isProduction && !verifySetupSecret(setupSecret)) {
    throw new AppError("Invalid registration credentials.", 403);
  }

  // Hash the password before storing it.
  const passwordHash = await hashPassword(password);

  // Generate verification token.
  const verificationToken = generateVerificationToken();
  const tokenHash = hashVerificationToken(verificationToken);

  // Set verification token expiration.
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  );

  try {
    const registration = await createUserWithVerificationToken({
      fullName,
      email,
      passwordHash,
      tokenHash,
      expiresAt,
      enforceSingleAccount: isProduction,
    });

    if (!registration) {
      throw new AppError("An account has already been registered.", 409);
    }

    return {
      user: {
        id: registration.user.id,
        fullName: registration.user.full_name,
        email: registration.user.email,
      },
      verificationToken,
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "An account with this email address already exists.",
        409,
      );
    }

    throw error;
  }
};

export const resendVerificationEmail = async (email) => {
  // 1. Generate a new verification token.
  const verificationToken = generateVerificationToken();

  // 2. Hash the token before storing it.
  const tokenHash = hashVerificationToken(verificationToken);

  // 3. Set token expiration.
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  );

  // 4. Create a new token and invalidate previous tokens.
  const result = await createResendVerificationToken({
    email,
    tokenHash,
    expiresAt,
  });

  // 5. Do not reveal whether the account exists or is verified.
  if (!result) {
    return;
  }

  // 6. Send the new verification email.
  await sendVerificationEmail({
    to: result.user.email,
    fullName: result.user.full_name,
    verificationToken,
  });
};
