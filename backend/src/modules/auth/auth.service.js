import {
  findUserByEmail,
  verifyEmailToken,
  findUserById,
} from "./auth.repository.js";
import { hashVerificationToken } from "../../utils/verificationToken.js";
import { comparePassword } from "../../utils/password.js";
import AppError from "../../utils/AppError.js";

export const verifyCredentials = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.email_verified_at) {
    throw new AppError("Please verify your email before signing in.", 403);
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
  };
};

export const verifyUserEmail = async (token) => {
  if (!token || typeof token !== "string") {
    throw new AppError("Verification link is invalid or has expired.", 400);
  }

  const tokenHash = hashVerificationToken(token);

  const user = await verifyEmailToken(tokenHash);

  if (!user) {
    throw new AppError("Verification link is invalid or has expired.", 400);
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    emailVerifiedAt: user.email_verified_at,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    emailVerifiedAt: user.email_verified_at,
  };
};
