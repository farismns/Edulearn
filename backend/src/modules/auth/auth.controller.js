import {
  registerUser,
  resendVerificationEmail,
} from "./auth.registration.service.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../email/email.service.js";
import {
  verifyCredentials,
  verifyUserEmail,
  getCurrentUser,
} from "./auth.service.js";
import {
  changePassword,
  requestPasswordReset,
  resetPassword,
} from "./auth.password.service.js";
import { createUserSession, revokeUserSession } from "./session.service.js";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "../../config/sessionCookie.js";

export const register = async (req, res, next) => {
  try {
    const registration = await registerUser(req.body);

    await sendVerificationEmail({
      to: registration.user.email,
      fullName: registration.user.fullName,
      verificationToken: registration.verificationToken,
    });

    return res.status(202).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        email: registration.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await verifyUserEmail(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message:
        "If an account requires verification, a new verification email will be sent.",
    });
  } catch (error) {
    next(error);
  }
};

const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an account exists with this email address, you will receive a password reset link.";

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body.email);

    if (result) {
      try {
        await sendPasswordResetEmail(result);
      } catch (error) {
        // Keep account-enumeration behavior consistent when delivery fails.
        console.error("Password reset email delivery failed.");
      }
    }

    return res.status(200).json({
      success: true,
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    await resetPassword({
      resetToken: req.body.token,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now sign in.",
    });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req, res, next) => {
  try {
    await changePassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verify user credentials
    const user = await verifyCredentials(email, password);

    // Create a new session
    const session = await createUserSession(user.id);

    // Set HTTP-only session cookie
    res.cookie(
      SESSION_COOKIE_NAME,
      session.sessionToken,
      getSessionCookieOptions(),
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.edulearn_session;

    await revokeUserSession(sessionToken);

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    next(error);
  }
};
