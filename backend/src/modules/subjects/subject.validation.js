import Joi from "joi";

const subjectName = Joi.string().trim().min(1).max(100).required().messages({
  "string.empty": "Subject name is required.",
  "any.required": "Subject name is required.",
});

export const createSubjectSchema = Joi.object({ name: subjectName });
export const renameSubjectSchema = Joi.object({ name: subjectName });

export const subjectIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required(),
});

export const subjectListQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow("").default(""),
  status: Joi.string().valid("Active", "Inactive", "All").default("All"),
});

export const deleteSubjectSchema = Joi.object({
  confirm: Joi.boolean().default(false),
});

