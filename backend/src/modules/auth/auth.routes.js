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
  forgotPasswordIpLimiter,
  forgotPasswordEmailLimiter,
} from "../../middlewares/resendVerifyRateLimit.middleware.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import { getMe } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

router.post(
  "/resend-verification",
  resendVerificationIpLimiter,
  validate(resendVerificationSchema),
  resendVerificationEmailLimiter,
  resendVerification,
);

router.post("/login", validate(loginSchema), login);

router.post(
  "/forgot-password",
  forgotPasswordIpLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordEmailLimiter,
  forgotPassword,
);

router.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePasswordHandler,
);

router.get("/me", authenticate, getMe);

router.post("/logout", logout);

export default router;
