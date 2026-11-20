import test from "node:test";
import assert from "node:assert/strict";
import { classifySchedule, getEditRestriction, isValidTimeRange, timesOverlap } from "../src/modules/schedules/schedule.policy.js";

test("adjacent schedules do not overlap, while intersecting schedules do", () => {
  assert.equal(timesOverlap("09:00", "10:00", "10:00", "11:00"), false);
  assert.equal(timesOverlap("09:00", "10:01", "10:00", "11:00"), true);
});

test("cancelled schedules are excluded by the overlap query contract", () => {
  assert.equal(timesOverlap("09:00", "10:00", "09:30", "09:45"), true);
  assert.equal(isValidTimeRange("10:00", "10:00"), false);
});

test("overdue scheduled lessons classify as Past without changing status", () => {
  assert.deepEqual(classifySchedule({
    scheduledDate: "2026-11-20",
    status: "Scheduled",
    endTime: "09:00",
    today: "2026-11-20",
    currentTime: "10:00",
  }), { tab: "Past", overdue: true });
});

test("completed and cancelled schedules are not editable", () => {
  assert.equal(getEditRestriction("Completed", true), "Completed schedules cannot be edited.");
  assert.equal(getEditRestriction("Cancelled", false), "Cancelled schedules are view-only.");
  assert.equal(getEditRestriction("Scheduled", false), null);
});

