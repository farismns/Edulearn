import * as studentService from "./student.service.js";

const withErrorHandling = (handler) => async (req, res, next) => {
  try { return await handler(req, res); } catch (error) { return next(error); }
};

export const listStudents = withErrorHandling(async (req, res) => {
  const data = await studentService.listStudents({
    userId: req.user.id,
    status: req.query.status || "Active",
    search: req.query.search || "",
    page: Number(req.query.page || 1),
    pageSize: Number(req.query.pageSize || 5),
  });
  return res.status(200).json({ success: true, data });
});

export const getStudent = withErrorHandling(async (req, res) => res.status(200).json({ success: true, data: { student: await studentService.getStudent(req.user.id, req.params.id) } }));
export const createStudent = withErrorHandling(async (req, res) => res.status(201).json({ success: true, message: "Student created successfully.", data: { student: await studentService.createStudent(req.user.id, req.body) } }));
export const updateStudent = withErrorHandling(async (req, res) => res.status(200).json({ success: true, message: "Student updated successfully.", data: { student: await studentService.updateStudent(req.user.id, req.params.id, req.body) } }));
export const archiveStudent = withErrorHandling(async (req, res) => res.status(200).json({ success: true, message: "Student archived successfully.", data: { student: await studentService.archiveStudent(req.user.id, req.params.id) } }));
export const restoreStudent = withErrorHandling(async (req, res) => res.status(200).json({ success: true, message: "Student restored successfully.", data: { student: await studentService.restoreStudent(req.user.id, req.params.id) } }));

