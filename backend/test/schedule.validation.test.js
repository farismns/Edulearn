import test from "node:test";
import assert from "node:assert/strict";
import { createScheduleSchema, scheduleListQuerySchema } from "../src/modules/schedules/schedule.validation.js";

const validSchedule = {
  studentId: "1",
  subjectId: "2",
  scheduledDate: "2026-12-01",
  startTime: "09:00",
  endTime: "10:00",
};

test("schedule validation accepts a valid payload", () => {
  assert.equal(createScheduleSchema.validate(validSchedule).error, undefined);
});

test("schedule validation rejects malformed identifiers and times", () => {
  assert.ok(createScheduleSchema.validate({ ...validSchedule, studentId: "student-1" }).error);
  assert.ok(createScheduleSchema.validate({ ...validSchedule, scheduledDate: "2026-2-30" }).error);
  assert.ok(createScheduleSchema.validate({ ...validSchedule, startTime: "25:00" }).error);
});

test("schedule list query defaults to Upcoming and page size five", () => {
  const { value, error } = scheduleListQuerySchema.validate({});
  assert.equal(error, undefined);
  assert.equal(value.tab, "Upcoming");
  assert.equal(value.pageSize, 5);
});

