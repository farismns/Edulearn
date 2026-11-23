import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "../../config/sessionCookie.js";
import * as service from "./settings.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res);
  } catch (error) {
    return next(error);
  }
};

export const getSettings = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      data: { settings: await service.getSettings(req.user.id) },
    }),
);
export const updateProfile = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Profile settings saved successfully.",
      data: { settings: await service.updateProfile(req.user.id, req.body) },
    }),
);
export const updatePublicContact = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Public contact settings saved successfully.",
      data: {
        settings: await service.updatePublicContact(req.user.id, req.body),
      },
    }),
);
export const updateAppearance = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Appearance settings saved successfully.",
      data: { settings: await service.updateAppearance(req.user.id, req.body) },
    }),
);
export const updatePassword = handle(async (req, res) => {
  await service.updatePassword(req.user.id, req.body);
  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());
  return res
    .status(200)
    .json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
});
