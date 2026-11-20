import Joi from "joi";

export const registerSchema = Joi.object({
  setupSecret: Joi.string().max(255).optional(),

  fullName: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Full name is required.",
    "string.max": "Full name must not exceed 100 characters.",
    "any.required": "Full name is required.",
  }),

  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    "string.email": "Please provide a valid email address.",
    "string.max": "Email must not exceed 255 characters.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must contain at least 8 characters.",
    "any.required": "Password is required.",
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Confirm password is required.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().hex().length(64).required().messages({
    "string.empty": "Verification token is required.",
    "string.hex": "Verification token format is invalid.",
    "string.length": "Verification token format is invalid.",
    "any.required": "Verification token is required.",
  }),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    "string.email": "Please provide a valid email address.",
    "string.max": "Email must not exceed 255 characters.",
    "any.required": "Email is required.",
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    "string.email": "Please provide a valid email address.",
    "string.max": "Email must not exceed 255 characters.",
    "any.required": "Email is required.",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required().messages({
    "string.empty": "Reset token is required.",
    "string.hex": "Reset token format is invalid.",
    "string.length": "Reset token format is invalid.",
    "any.required": "Reset token is required.",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Password must contain at least 8 characters.",
    "any.required": "New password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Confirm password is required.",
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required.",
    "any.required": "Current password is required.",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Password must contain at least 8 characters.",
    "any.required": "New password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Confirm password is required.",
  }),
});
