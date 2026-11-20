import {
  createPasswordResetToken,
  findUserPasswordById,
  resetPasswordWithToken,
  updatePasswordAndRevokeSessions,
} from "./auth.repository.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../../utils/verificationToken.js";
import AppError from "../../utils/AppError.js";

const validateNewPassword = (newPassword, confirmPassword) => {
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new AppError("Password must contain at least 8 characters.", 400);
  }

  if (typeof confirmPassword !== "string" || newPassword !== confirmPassword) {
    throw new AppError("Passwords do not match.", 400);
  }
};

export const requestPasswordReset = async (email) => {
  const resetToken = generateVerificationToken();
  const tokenHash = hashVerificationToken(resetToken);

  const user = await createPasswordResetToken({ email, tokenHash });

  if (!user) {
    return null;
  }

  // The raw token is returned only for the caller to construct an email;
  // controllers must always return the MVP's generic response to the client.
  return {
    email: user.email,
    fullName: user.full_name,
    resetToken,
  };
};

export const resetPassword = async ({
  resetToken,
  newPassword,
  confirmPassword,
}) => {
  if (typeof resetToken !== "string" || resetToken.length === 0) {
    throw new AppError("Password reset link is invalid or has expired.", 400);
  }

  validateNewPassword(newPassword, confirmPassword);

  const tokenHash = hashVerificationToken(resetToken);
  const passwordHash = await hashPassword(newPassword);

  const result = await resetPasswordWithToken({ tokenHash, passwordHash });

  if (!result) {
    throw new AppError("Password reset link is invalid or has expired.", 400);
  }

  return { userId: result.userId };
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  validateNewPassword(newPassword, confirmPassword);

  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    throw new AppError("Current password is incorrect.", 401);
  }

  const user = await findUserPasswordById(userId);

  if (!user || !(await comparePassword(currentPassword, user.password_hash))) {
    throw new AppError("Current password is incorrect.", 401);
  }

  const passwordHash = await hashPassword(newPassword);
  const result = await updatePasswordAndRevokeSessions({ userId, passwordHash });

  if (!result) {
    throw new AppError("User not found.", 404);
  }

  return { userId: result.userId };
};

