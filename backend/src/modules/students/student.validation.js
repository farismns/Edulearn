import Joi from "joi";
import { STUDENT_AVATAR_IDENTIFIERS } from "./student.avatar.catalog.js";

export const educationLevels = ["Elementary School", "Junior High School"];

// Stored legacy values remain readable because this schema is used only for
// incoming create/update requests.
const avatar = Joi.string()
  .trim()
  .valid(...STUDENT_AVATAR_IDENTIFIERS)
  .required()
  .messages({
    "any.only": "Avatar must be a supported preset avatar.",
    "any.required": "Avatar is required.",
  });

const subjectIds = Joi.array()
  .items(Joi.string().pattern(/^\d+$/).messages({
    "string.pattern.base": "Subject IDs must be numeric.",
  }))
  .min(1)
  .unique()
  .required()
  .messages({
    "array.min": "At least one subject is required.",
    "any.required": "At least one subject is required.",
  });

const optionalText = (max, message) =>
  Joi.string().trim().max(max).allow(null, "").messages({
    "string.max": message,
  });

export const createStudentSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(150).required().messages({
    "any.required": "Full name is required.",
    "string.empty": "Full name is required.",
  }),
  educationLevel: Joi.string().valid(...educationLevels).required().messages({
    "any.only": "Education level must be Elementary School or Junior High School.",
    "any.required": "Education level is required.",
  }),
  subjectIds,
  studentContact: optionalText(30, "Student contact must not exceed 30 characters."),
  guardianName: optionalText(150, "Guardian name must not exceed 150 characters."),
  guardianWhatsapp: optionalText(20, "Guardian WhatsApp number must not exceed 20 characters."),
  avatar,
});

export const updateStudentSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(150).messages({
    "string.empty": "Full name cannot be empty.",
  }),
  educationLevel: Joi.string().valid(...educationLevels).messages({
    "any.only": "Education level must be Elementary School or Junior High School.",
  }),
  subjectIds: subjectIds.optional(),
  studentContact: optionalText(30, "Student contact must not exceed 30 characters."),
  guardianName: optionalText(150, "Guardian name must not exceed 150 characters."),
  guardianWhatsapp: optionalText(20, "Guardian WhatsApp number must not exceed 20 characters."),
  avatar: avatar.optional(),
}).min(1);

export const studentIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required(),
});

export const studentListQuerySchema = Joi.object({
  status: Joi.string().valid("Active", "Archived").default("Active"),
  search: Joi.string().trim().max(150).allow("").default(""),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().valid(5, 10).default(5),
});

