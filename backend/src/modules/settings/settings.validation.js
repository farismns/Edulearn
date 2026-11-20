import Joi from "joi";
import { STUDENT_AVATAR_IDENTIFIERS } from "../students/student.avatar.catalog.js";

const fullName = Joi.string().trim().min(1).max(100).required().messages({
  "string.empty": "Full name is required.",
  "any.required": "Full name is required.",
});

const avatar = Joi.string().trim().valid(...STUDENT_AVATAR_IDENTIFIERS).required().messages({
  "any.only": "Avatar must be a supported preset avatar.",
  "any.required": "Avatar is required.",
});

const whatsappNumber = Joi.string()
  .trim()
  .pattern(/^[1-9][0-9]{7,14}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "WhatsApp number must contain international digits only.",
  });

export const profileSchema = Joi.object({ fullName, avatar });
export const publicContactSchema = Joi.object({ whatsappNumber }).min(1);
export const appearanceSchema = Joi.object({
  theme: Joi.string().valid("Light", "Dark", "System").required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

