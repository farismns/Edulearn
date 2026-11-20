import AppError from "../../utils/AppError.js";
import {
  createStudent as createStudentRecord,
  findStudentById,
  findSubjectsForStudent,
  listStudents as listStudentRecords,
  setStudentStatus,
  updateStudent as updateStudentRecord,
} from "./student.repository.js";

const normalize = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === "" ? null : value]));

const resultOrError = (result) => {
  if (result?.invalidSubjects) throw new AppError("One or more subjects are invalid or inactive.", 400);
  if (result?.notFound) throw new AppError("Student not found.", 404);
  return result;
};

export const listStudents = async ({ userId, status = "Active", search = "", page = 1, pageSize = 5 }) => {
  const result = await listStudentRecords({ userId, status, search, page, pageSize });
  return {
    items: result.items,
    pagination: { page, pageSize, totalItems: result.total, totalPages: Math.ceil(result.total / pageSize) },
  };
};

export const getStudent = async (userId, studentId) => {
  const student = await findStudentById(userId, studentId);
  if (!student) throw new AppError("Student not found.", 404);
  return { ...student, subjects: await findSubjectsForStudent(userId, studentId) };
};

export const createStudent = async (userId, data) => {
  const result = resultOrError(await createStudentRecord({ userId, data: normalize(data), subjectIds: data.subjectIds }));
  return { ...result.student, subjects: result.subjects };
};

export const updateStudent = async (userId, studentId, data) => {
  const result = resultOrError(await updateStudentRecord({ userId, studentId, data: normalize(data), subjectIds: data.subjectIds }));
  return { ...result.student, subjects: result.subjects };
};

export const archiveStudent = async (userId, studentId) => {
  const student = await setStudentStatus(userId, studentId, "Archived");
  if (!student) throw new AppError("Student not found.", 404);
  return student;
};

export const restoreStudent = async (userId, studentId) => {
  const student = await setStudentStatus(userId, studentId, "Active");
  if (!student) throw new AppError("Student not found.", 404);
  return student;
};

