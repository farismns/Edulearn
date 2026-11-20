import Joi from "joi";

const id = Joi.string().pattern(/^\d+$/).required();
const date = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required();
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required();

export const createScheduleSchema = Joi.object({
  studentId: id,
  subjectId: id,
  scheduledDate: date,
  startTime: time,
  endTime: time,
  notes: Joi.string().trim().allow(null, "").max(5000),
});

export const updateScheduleSchema = Joi.object({
  studentId: id.optional(),
  subjectId: id.optional(),
  scheduledDate: date.optional(),
  startTime: time.optional(),
  endTime: time.optional(),
  notes: Joi.string().trim().allow(null, "").max(5000),
}).min(1);

export const scheduleIdSchema = Joi.object({ id });

export const scheduleListQuerySchema = Joi.object({
  tab: Joi.string().valid("Upcoming", "Past").default("Upcoming"),
  search: Joi.string().trim().max(150).allow("").default(""),
  subjectId: Joi.string().pattern(/^\d+$/),
  status: Joi.string().valid("Scheduled", "Completed", "Cancelled"),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().valid(5, 10).default(5),
  sort: Joi.string().valid("asc", "desc"),
});

export const deleteScheduleSchema = Joi.object({ confirm: Joi.boolean().default(false) });

