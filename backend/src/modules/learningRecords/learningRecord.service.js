import AppError from "../../utils/AppError.js";
import * as repository from "./learningRecord.repository.js";

export const listRecords = async (options) => {
  const result = await repository.listRecords(options);
  return {
    items: result.items,
    pagination: { page: options.page, pageSize: options.pageSize, totalItems: result.total, totalPages: Math.ceil(result.total / options.pageSize) },
  };
};

export const getRecord = async (userId, recordId) => {
  const record = await repository.findRecordById(userId, recordId);
  if (!record) throw new AppError("Learning record not found.", 404);
  return record;
};

export const createFromSchedule = async (userId, scheduleId, data) => {
  const result = await repository.createFromSchedule({ userId, scheduleId, ...data });
  if (result.notFound) throw new AppError("Schedule not found.", 404);
  if (result.invalidStatus) throw new AppError("Only Scheduled schedules can record a lesson.", 409);
  if (result.duplicate) throw new AppError("This schedule already has a learning record.", 409);
  if (result.transitionFailed) throw new AppError("Schedule could not be completed.", 409);
  return result;
};

export const updateRecord = async (userId, recordId, data) => {
  const existing = await getRecord(userId, recordId);
  const record = await repository.updateRecord({
    userId,
    recordId,
    learningMaterial: data.learningMaterial,
    notes: data.notes === undefined ? existing.notes : data.notes,
  });
  if (!record) throw new AppError("Learning record could not be updated.", 409);
  return record;
};

