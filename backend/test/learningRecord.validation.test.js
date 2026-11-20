import test from "node:test";
import assert from "node:assert/strict";
import { recordLessonSchema, updateLearningRecordSchema } from "../src/modules/learningRecords/learningRecord.validation.js";

test("record lesson requires learning material and accepts optional notes", () => {
  assert.equal(recordLessonSchema.validate({ learningMaterial: "Fractions", notes: "Review homework" }).error, undefined);
  assert.ok(recordLessonSchema.validate({ notes: "Missing material" }).error);
});

test("record lesson input cannot supply immutable schedule fields", () => {
  const result = recordLessonSchema.validate({ learningMaterial: "Fractions", studentId: "1", scheduledDate: "2026-12-01" });
  assert.ok(result.error);
});

test("learning record updates accept only editable fields", () => {
  assert.equal(updateLearningRecordSchema.validate({ learningMaterial: "Decimals" }).error, undefined);
  assert.ok(updateLearningRecordSchema.validate({ studentId: "2" }).error);
});

