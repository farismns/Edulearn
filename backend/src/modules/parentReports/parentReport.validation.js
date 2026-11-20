import Joi from "joi";

const studentId = Joi.string().pattern(/^\d+$/).required();
const reportId = Joi.string().pattern(/^\d+$/).required();
const reportingMonth = Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).required();

export const studentReportParamsSchema = Joi.object({ studentId });
export const reportParamsSchema = Joi.object({ id: reportId });

export const reportMonthQuerySchema = Joi.object({ reportingMonth });

export const generateReportSchema = Joi.object({
  reportingMonth,
  tutorMessage: Joi.string().trim().min(1).max(5000).required().messages({
    "string.empty": "Tutor message is required.",
    "any.required": "Tutor message is required.",
  }),
});

