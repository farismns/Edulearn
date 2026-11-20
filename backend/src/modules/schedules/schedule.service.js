import AppError from "../../utils/AppError.js";
import * as repository from "./schedule.repository.js";
import { getEditRestriction, isValidTimeRange } from "./schedule.policy.js";

const validateRange = (startTime, endTime) => {
  if (!isValidTimeRange(startTime, endTime)) throw new AppError("End time must be after start time.", 400);
};

const validateCalendarDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError("Scheduled date is invalid.", 400);
  }
};

const validateSelection = async (userId, studentId, subjectId) => {
  const selection = await repository.findStudentSubjectForScheduling(userId, studentId, subjectId);
  if (!selection || selection.student_status !== "Active" || selection.subject_status !== "Active") {
    throw new AppError("An active student with an active assigned subject is required.", 400);
  }
  return selection;
};

const withOverlapWarning = (schedule, overlaps) => ({
  schedule,
  warning: overlaps.length > 0
    ? { code: "SCHEDULE_OVERLAP", message: "This schedule overlaps another scheduled lesson.", conflicts: overlaps }
    : null,
});

export const listSchedules = async (options) => {
  const result = await repository.listSchedules(options);
  return {
    items: result.items,
    pagination: { page: options.page, pageSize: options.pageSize, totalItems: Number(result.total), totalPages: Math.ceil(Number(result.total) / options.pageSize) },
  };
};

export const getSchedule = async (userId, scheduleId) => {
  const schedule = await repository.findScheduleById(userId, scheduleId);
  if (!schedule) throw new AppError("Schedule not found.", 404);
  return schedule;
};

export const createSchedule = async (userId, data) => {
  validateCalendarDate(data.scheduledDate);
  validateRange(data.startTime, data.endTime);
  const selection = await validateSelection(userId, data.studentId, data.subjectId);
  const overlaps = await repository.findOverlaps({ userId, ...data });
  const schedule = await repository.createSchedule({ userId, data, subjectName: selection.subject_name });
  return withOverlapWarning(schedule, overlaps);
};

export const updateSchedule = async (userId, scheduleId, data) => {
  const existing = await getSchedule(userId, scheduleId);
  const editRestriction = getEditRestriction(existing.status, existing.hasLearningRecord);
  if (editRestriction) throw new AppError(editRestriction, 409);
  const merged = {
    studentId: data.studentId ?? existing.studentId,
    subjectId: data.subjectId ?? existing.subjectId,
    scheduledDate: data.scheduledDate ?? existing.scheduledDate,
    startTime: data.startTime ?? existing.startTime,
    endTime: data.endTime ?? existing.endTime,
    notes: data.notes === undefined ? existing.notes : data.notes,
  };
  validateCalendarDate(merged.scheduledDate);
  validateRange(merged.startTime, merged.endTime);
  let subjectName;
  if (data.studentId !== undefined || data.subjectId !== undefined) {
    if (!merged.subjectId) throw new AppError("An active assigned subject is required.", 400);
    const selection = await validateSelection(userId, merged.studentId, merged.subjectId);
    subjectName = selection.subject_name;
  }
  const overlaps = await repository.findOverlaps({ userId, ...merged, excludeScheduleId: scheduleId });
  const schedule = await repository.updateSchedule({ userId, scheduleId, data: merged, subjectName });
  if (!schedule) throw new AppError("Schedule could not be updated.", 409);
  return withOverlapWarning(schedule, overlaps);
};

export const cancelSchedule = async (userId, scheduleId) => {
  const existing = await getSchedule(userId, scheduleId);
  if (existing.status === "Completed") throw new AppError("Completed schedules cannot be cancelled.", 409);
  if (existing.status === "Cancelled") throw new AppError("Schedule is already cancelled.", 409);
  if (existing.hasLearningRecord) throw new AppError("A schedule with a learning record cannot be cancelled.", 409);
  const schedule = await repository.cancelSchedule(userId, scheduleId);
  if (!schedule) throw new AppError("Schedule could not be cancelled.", 409);
  return schedule;
};

export const deleteSchedule = async (userId, scheduleId, confirm) => {
  const existing = await getSchedule(userId, scheduleId);
  if (existing.status !== "Scheduled" || existing.hasLearningRecord) {
    throw new AppError("Only Scheduled schedules without learning records can be deleted.", 409);
  }
  if (!confirm) throw new AppError("Confirmation is required to delete this schedule.", 409);
  const deletedId = await repository.deleteSchedule(userId, scheduleId);
  if (!deletedId) throw new AppError("Schedule could not be deleted.", 409);
  return { id: deletedId };
};

