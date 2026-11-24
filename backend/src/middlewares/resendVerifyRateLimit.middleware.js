import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const rateLimitMessage = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const createIpLimiter = (limit = 10) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  });

const createEmailLimiter = (limit = 3) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,

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

// Registration is an infrequent setup action. Keep both dimensions bounded.
export const registerIpLimiter = createIpLimiter(5);
export const registerEmailLimiter = createEmailLimiter(3);

// Verification tokens are high-entropy, but requests are still bounded per IP.
export const verifyEmailIpLimiter = createIpLimiter(10);

// Login receives an additional email/IP limit to slow targeted guessing.
export const loginIpLimiter = createIpLimiter(10);
export const loginEmailLimiter = createEmailLimiter(5);

// Forgot Password uses the same established thresholds and response.
export const forgotPasswordIpLimiter = createIpLimiter();
export const forgotPasswordEmailLimiter = createEmailLimiter();

// Reset tokens are high-entropy, but invalid-token attempts are still bounded.
export const resetPasswordIpLimiter = createIpLimiter(10);

// Password changes are authenticated but remain a sensitive mutation.
export const changePasswordIpLimiter = createIpLimiter(10);
