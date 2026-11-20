import test from "node:test";
import assert from "node:assert/strict";
import { buildSnapshotData, EMPTY_REPORT_MESSAGE, getMonthBounds } from "../src/modules/parentReports/parentReport.policy.js";
import { generateParentReportPdf } from "../src/modules/parentReports/parentReport.pdf.js";
import { generateReportSchema } from "../src/modules/parentReports/parentReport.validation.js";

test("monthly bounds handle December correctly", () => {
  assert.deepEqual(getMonthBounds("2026-12"), { start: "2026-12-01", endExclusive: "2027-01-01" });
});

test("snapshot data preserves subject names and excludes internal notes", () => {
  const data = buildSnapshotData({
    student: { id: "1", fullName: "Student", educationLevel: "Elementary School" },
    reportingMonth: "2026-11",
    records: [{ subjectId: "2", subjectName: "Mathematics", lessonDate: "2026-11-10", learningMaterial: "Fractions", notes: "Internal" }],
  });
  assert.equal(data.summary.completedLessonCount, 1);
  assert.equal(data.subjects[0].subjectName, "Mathematics");
  assert.equal(JSON.stringify(data).includes("Internal"), false);
});

test("empty report message is stable and tutor message is required", () => {
  assert.equal(EMPTY_REPORT_MESSAGE, "No completed learning records found for the selected period.");
  assert.ok(generateReportSchema.validate({ reportingMonth: "2026-11" }).error);
});

test("PDF generation produces a PDF payload without internal notes", () => {
  const pdf = generateParentReportPdf({
    snapshotData: {
      student: { fullName: "Student", educationLevel: "Elementary School" },
      reportingMonth: "2026-11",
      summary: { completedLessonCount: 1, subjectCount: 1 },
      subjects: [{ subjectName: "Mathematics", lessons: [{ lessonDate: "2026-11-10", learningMaterial: "Fractions" }] }],
    },
    tutorMessage: "Good progress.",
    generatedAt: "2026-11-20T00:00:00.000Z",
  });
  assert.equal(pdf.subarray(0, 8).toString(), "%PDF-1.4");
  assert.equal(pdf.toString().includes("Internal"), false);
});

