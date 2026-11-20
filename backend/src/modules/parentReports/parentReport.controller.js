import * as service from "./parentReport.service.js";

const handle = (fn) => async (req, res, next) => {
  try { return await fn(req, res); } catch (error) { return next(error); }
};

export const previewReport = handle(async (req, res) => res.status(200).json({ success: true, data: await service.previewReport(req.user.id, req.params.studentId, req.query.reportingMonth) }));
export const listHistory = handle(async (req, res) => res.status(200).json({ success: true, data: { reports: await service.listHistory(req.user.id, req.params.studentId) } }));
export const generateReport = handle(async (req, res) => res.status(201).json({ success: true, message: "Parent report generated successfully.", data: { report: await service.generateReport(req.user.id, req.params.studentId, req.body.reportingMonth, req.body.tutorMessage) } }));
export const getSnapshot = handle(async (req, res) => res.status(200).json({ success: true, data: { report: await service.getSnapshot(req.user.id, req.params.id) } }));
export const getDownloadUrl = handle(async (req, res) => res.status(200).json({ success: true, data: await service.getDownloadUrl(req.user.id, req.params.id) }));

