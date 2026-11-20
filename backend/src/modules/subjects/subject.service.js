import AppError from "../../utils/AppError.js";
import * as repository from "./subject.repository.js";

const handleUniqueViolation = (error) => {
  if (error.code === "23505") throw new AppError("A subject with this name already exists.", 409);
  throw error;
};

export const listSubjects = (options) => repository.listSubjects(options);

export const createSubject = async (userId, name) => {
  try { return await repository.createSubject(userId, name); } catch (error) { handleUniqueViolation(error); }
};

export const renameSubject = async (userId, subjectId, name) => {
  const existing = await repository.findSubjectById(userId, subjectId);
  if (!existing) throw new AppError("Subject not found.", 404);
  if (existing.isDefault) throw new AppError("Default subjects cannot be renamed.", 409);
  try { return await repository.renameSubject(userId, subjectId, name); } catch (error) { handleUniqueViolation(error); }
};

export const setStatus = async (userId, subjectId, status) => {
  const subject = await repository.setSubjectStatus(userId, subjectId, status);
  if (!subject) throw new AppError("Subject not found.", 404);
  return subject;
};

export const deleteSubject = async (userId, subjectId, confirm) => {
  const result = await repository.deleteSubject({ userId, subjectId, confirm });
  if (result.notFound) throw new AppError("Subject not found.", 404);
  if (result.defaultSubject) throw new AppError("Default subjects cannot be deleted.", 409);
  if (result.restricted) throw new AppError("Subject cannot be deleted because historical or active references remain.", 409);
  if (result.needsConfirmation) {
    const error = new AppError("Confirmation is required to remove this subject from affected students.", 409);
    error.details = { affectedStudents: result.analysis.affectedStudents };
    error.exposeDetails = true;
    throw error;
  }
  return { id: subjectId, affectedStudents: result.analysis.affectedStudents };
};

