import { randomBytes, timingSafeEqual } from "node:crypto";

export const CSRF_COOKIE_NAME = "edulearn_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.SESSION_COOKIE_SAME_SITE || "lax",
  path: "/",
});

const generateCsrfToken = () => randomBytes(32).toString("hex");

const tokensMatch = (cookieToken, headerToken) => {
  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    !TOKEN_PATTERN.test(cookieToken) ||
    !TOKEN_PATTERN.test(headerToken)
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(cookieToken, "utf8"),
    Buffer.from(headerToken, "utf8"),
  );
};

export const issueCsrfToken = (req, res) => {
  const token = TOKEN_PATTERN.test(req.cookies?.[CSRF_COOKIE_NAME] || "")
    ? req.cookies[CSRF_COOKIE_NAME]
    : generateCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());

  return res.status(200).json({
    success: true,
    data: { csrfToken: token },
  });
};

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!tokensMatch(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      message: "CSRF validation failed.",
    });
  }

  return next();
};

export default csrfProtection;
