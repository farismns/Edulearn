import { randomUUID } from "node:crypto";
import AppError from "../../utils/AppError.js";
import * as repository from "./parentReport.repository.js";
import { buildSnapshotData, EMPTY_REPORT_MESSAGE, getMonthBounds } from "./parentReport.policy.js";
import { generateParentReportPdf } from "./parentReport.pdf.js";
import { createPrivateDownloadUrl, deletePrivateObject, uploadPrivatePdf } from "./parentReport.storage.js";

const getReportContext = async (userId, studentId, reportingMonth) => {
  const student = await repository.findStudentForReport(userId, studentId);
  if (!student) throw new AppError("Student not found.", 404);
  const records = await repository.findEligibleRecords({ userId, studentId, ...getMonthBounds(reportingMonth) });
  return { student, records };
};

export const previewReport = async (userId, studentId, reportingMonth) => {
  const { student, records } = await getReportContext(userId, studentId, reportingMonth);
  const snapshotData = buildSnapshotData({ student, reportingMonth, records });
  return {
    canGenerate: records.length > 0,
    message: records.length > 0 ? null : EMPTY_REPORT_MESSAGE,
    student,
    reportingMonth,
    summary: snapshotData.summary,
    subjects: snapshotData.subjects,
  };
};

export const generateReport = async (userId, studentId, reportingMonth, tutorMessage) => {
  const { student, records } = await getReportContext(userId, studentId, reportingMonth);
  if (records.length === 0) throw new AppError(EMPTY_REPORT_MESSAGE, 400);
  const snapshotData = buildSnapshotData({ student, reportingMonth, records });
  const pdfBody = generateParentReportPdf({ snapshotData, tutorMessage, generatedAt: new Date().toISOString() });
  const key = `parent-reports/${userId}/${studentId}/${reportingMonth}/${randomUUID()}.pdf`;
  const pdf = { ...(await uploadPrivatePdf({ key, body: pdfBody })), fileName: `parent-report-${studentId}-${reportingMonth}.pdf` };
  try {
    return await repository.saveSnapshot({ userId, studentId, reportingMonth, tutorMessage, snapshotData, pdf });
  } catch (error) {
    try { await deletePrivateObject(key); } catch { /* best-effort cleanup */ }
    throw error;
  }
};

export const listHistory = async (userId, studentId) => {
  const student = await repository.findStudentForReport(userId, studentId);
  if (!student) throw new AppError("Student not found.", 404);
  return repository.listSnapshots(userId, studentId);
};

export const getSnapshot = async (userId, snapshotId) => {
  const snapshot = await repository.findSnapshotById(userId, snapshotId);
  if (!snapshot) throw new AppError("Parent report not found.", 404);
  return snapshot;
};

export const getDownloadUrl = async (userId, snapshotId) => {
  const snapshot = await getSnapshot(userId, snapshotId);
  if (!snapshot.pdfObjectKey) throw new AppError("PDF is not available for this report.", 404);
  const download = await createPrivateDownloadUrl({ key: snapshot.pdfObjectKey });
  return { ...download, fileName: snapshot.fileName };
};

