import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const rateLimitMessage = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const createIpLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  });

const createEmailLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,

    keyGenerator: (req) => {
      const email = req.body.email;
      const ip = ipKeyGenerator(req.ip);

      return `${ip}:${email}`;
    },

    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  });

// Existing Resend Verification limits.
export const resendVerificationIpLimiter = createIpLimiter();
export const resendVerificationEmailLimiter = createEmailLimiter();

// Forgot Password uses the same established thresholds and response.
export const forgotPasswordIpLimiter = createIpLimiter();
export const forgotPasswordEmailLimiter = createEmailLimiter();
