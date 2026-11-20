import test from "node:test";
import assert from "node:assert/strict";
import {
  createSubjectSchema,
  deleteSubjectSchema,
  subjectListQuerySchema,
} from "../src/modules/subjects/subject.validation.js";

test("subject names are trimmed and required", () => {
  const { value, error } = createSubjectSchema.validate({ name: "  Science  " });
  assert.equal(error, undefined);
  assert.equal(value.name, "Science");
  assert.ok(createSubjectSchema.validate({ name: "   " }).error);
});

test("subject list query defaults to all statuses", () => {
  const { value, error } = subjectListQuerySchema.validate({});
  assert.equal(error, undefined);
  assert.deepEqual(value, { search: "", status: "All" });
});

test("delete confirmation defaults to false", () => {
  const { value, error } = deleteSubjectSchema.validate({});
  assert.equal(error, undefined);
  assert.equal(value.confirm, false);
});

