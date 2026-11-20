export const SESSION_COOKIE_NAME = "edulearn_session";

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.SESSION_COOKIE_SAME_SITE || "lax",
  path: "/",
});
