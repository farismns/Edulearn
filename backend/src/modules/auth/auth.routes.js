import { Router } from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPasswordHandler,
  changePasswordHandler,
} from "./auth.controller.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  resendVerificationIpLimiter,
  resendVerificationEmailLimiter,
  registerIpLimiter,
  registerEmailLimiter,
  verifyEmailIpLimiter,
  loginIpLimiter,
  loginEmailLimiter,
  forgotPasswordIpLimiter,
  forgotPasswordEmailLimiter,
  resetPasswordIpLimiter,
  changePasswordIpLimiter,
} from "../../middlewares/resendVerifyRateLimit.middleware.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import { getMe } from "./auth.controller.js";
import { issueCsrfToken } from "../../middlewares/csrf.middleware.js";

const router = Router();

router.get("/csrf-token", issueCsrfToken);

router.post(
  "/register",
  registerIpLimiter,
  validate(registerSchema),
  registerEmailLimiter,
  register,
);

router.post(
  "/verify-email",
  verifyEmailIpLimiter,
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post(
  "/resend-verification",
  resendVerificationIpLimiter,
  validate(resendVerificationSchema),
  resendVerificationEmailLimiter,
  resendVerification,
);

router.post(
  "/login",
  loginIpLimiter,
  validate(loginSchema),
  loginEmailLimiter,
  login,
);

router.post(
  "/forgot-password",
  forgotPasswordIpLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordEmailLimiter,
  forgotPassword,
);

router.post(
  "/reset-password",
  resetPasswordIpLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler,
);

router.post(
  "/change-password",
  changePasswordIpLimiter,
  authenticate,
  validate(changePasswordSchema),
  changePasswordHandler,
);

router.get("/me", authenticate, getMe);

router.post("/logout", logout);

export default router;
