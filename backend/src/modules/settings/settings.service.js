import AppError from "../../utils/AppError.js";
import { changePassword } from "../auth/auth.password.service.js";
import * as repository from "./settings.repository.js";

const requireSettings = (settings) => {
  if (!settings) throw new AppError("User not found.", 404);
  return settings;
};

export const getSettings = async (userId) => requireSettings(await repository.getSettings(userId));
export const updateProfile = async (userId, data) => requireSettings(await repository.updateProfile(userId, data));
export const updatePublicContact = async (userId, data) => requireSettings(await repository.updatePublicContact(userId, data.whatsappNumber));
export const updateAppearance = async (userId, data) => requireSettings(await repository.updateAppearance(userId, data.theme));

export const updatePassword = async (userId, data) => {
  await changePassword({
    userId,
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
};

