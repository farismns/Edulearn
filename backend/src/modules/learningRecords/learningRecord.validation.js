import Joi from "joi";

const material = Joi.string().trim().min(1).max(10000).required().messages({
  "string.empty": "Learning material is required.",
  "any.required": "Learning material is required.",
});

export const recordLessonSchema = Joi.object({
  learningMaterial: material,
  notes: Joi.string().trim().allow(null, "").max(10000),
});

export const updateLearningRecordSchema = Joi.object({
  learningMaterial: material.optional(),
  notes: Joi.string().trim().allow(null, "").max(10000),
}).min(1);

export const learningRecordIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required(),
});

export const learningRecordScheduleIdSchema = Joi.object({
  scheduleId: Joi.string().pattern(/^\d+$/).required(),
});

export const learningRecordListQuerySchema = Joi.object({
  search: Joi.string().trim().max(150).allow("").default(""),
  studentId: Joi.string().pattern(/^\d+$/),
  subjectId: Joi.string().pattern(/^\d+$/),
  fromDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  toDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().valid(5, 10).default(5),
  sort: Joi.string().valid("asc", "desc").default("desc"),
});

