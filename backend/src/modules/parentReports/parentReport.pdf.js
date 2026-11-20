const escapePdfText = (value) => String(value ?? "")
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)")
  .replace(/[^\x20-\x7E]/g, "?");

export const generateParentReportPdf = ({ snapshotData, tutorMessage, generatedAt }) => {
  const lines = [
    "EduLearn Parent Report",
    `${snapshotData.student.fullName} - ${snapshotData.reportingMonth}`,
    `Education: ${snapshotData.student.educationLevel}`,
    `Completed lessons: ${snapshotData.summary.completedLessonCount}`,
    `Subjects: ${snapshotData.summary.subjectCount}`,
    "",
    `Tutor message: ${tutorMessage}`,
    "",
  ];
  for (const subject of snapshotData.subjects) {
    lines.push(`Subject: ${subject.subjectName}`);
    for (const lesson of subject.lessons) lines.push(`${lesson.lessonDate} - ${lesson.learningMaterial}`);
    lines.push("");
  }
  lines.push(`Generated: ${generatedAt}`);

  const content = ["BT", "/F1 11 Tf", "50 760 Td", ...lines.flatMap((line, index) => [
    `(${escapePdfText(line)}) Tj`,
    index < lines.length - 1 ? "0 -16 Td" : "",
  ]), "ET"].filter(Boolean).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, "utf8");
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
};

