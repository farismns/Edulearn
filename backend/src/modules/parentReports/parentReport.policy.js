export const EMPTY_REPORT_MESSAGE = "No completed learning records found for the selected period.";

export const getMonthBounds = (reportingMonth) => {
  const [year, month] = reportingMonth.split("-").map(Number);
  const start = `${reportingMonth}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endExclusive = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, endExclusive };
};

export const buildSnapshotData = ({ student, reportingMonth, records }) => {
  const subjects = new Map();
  for (const record of records) {
    const key = record.subjectId ?? `snapshot:${record.subjectName}`;
    if (!subjects.has(key)) subjects.set(key, { subjectId: record.subjectId, subjectName: record.subjectName, lessons: [] });
    subjects.get(key).lessons.push({ lessonDate: record.lessonDate, learningMaterial: record.learningMaterial });
  }
  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      educationLevel: student.educationLevel,
    },
    reportingMonth,
    summary: {
      completedLessonCount: records.length,
      subjectCount: subjects.size,
    },
    subjects: [...subjects.values()],
  };
};

