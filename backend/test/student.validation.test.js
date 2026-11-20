import test from "node:test";
import assert from "node:assert/strict";
import { createStudentSchema, studentListQuerySchema } from "../src/modules/students/student.validation.js";
import { STUDENT_AVATAR_IDENTIFIERS } from "../src/modules/students/student.avatar.catalog.js";

const validStudent = {
  fullName: "A Student",
  educationLevel: "Elementary School",
  subjectIds: ["1"],
  avatar: STUDENT_AVATAR_IDENTIFIERS[0],
};

test("student validation requires at least one subject and allows optional contact data", () => {
  assert.equal(createStudentSchema.validate(validStudent).error, undefined);
  assert.ok(createStudentSchema.validate({ ...validStudent, subjectIds: [] }).error);
});

test("student validation rejects unsupported education levels and unknown avatars", () => {
  assert.ok(createStudentSchema.validate({ ...validStudent, educationLevel: "High School" }).error);
  assert.ok(createStudentSchema.validate({ ...validStudent, avatar: "character_1" }).error);
  assert.ok(createStudentSchema.validate({ ...validStudent, avatar: "https://example.com/avatar.png" }).error);
});

test("student validation accepts every catalog identifier", () => {
  for (const avatar of STUDENT_AVATAR_IDENTIFIERS) {
    assert.equal(createStudentSchema.validate({ ...validStudent, avatar }).error, undefined);
  }
});

test("student list query defaults to active page size five", () => {
  const { value, error } = studentListQuerySchema.validate({});
  assert.equal(error, undefined);
  assert.deepEqual(value, { status: "Active", search: "", page: 1, pageSize: 5 });
});

