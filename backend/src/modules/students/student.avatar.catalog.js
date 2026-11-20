// Stable identifiers for the approved student-avatar catalog.
// Add new identifiers only; never reuse an existing identifier for another visual.
export const STUDENT_AVATAR_IDENTIFIERS = Object.freeze([
  "student_avatar_01",
  "student_avatar_02",
  "student_avatar_03",
  "student_avatar_04",
  "student_avatar_05",
  "student_avatar_06",
  "student_avatar_07",
  "student_avatar_08",
]);

export const isStudentAvatarIdentifier = (value) =>
  STUDENT_AVATAR_IDENTIFIERS.includes(value);

