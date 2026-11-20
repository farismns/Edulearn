import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_APPLICATION_TIME_ZONE,
  getDashboardDateParts,
  isOverdueDashboardSchedule,
  isTodaysLessonStatus,
  isUpcomingDashboardSchedule,
} from "../src/modules/dashboard/dashboard.policy.js";

test("dashboard defaults to Jakarta timezone", () => {
  assert.equal(DEFAULT_APPLICATION_TIME_ZONE, "Asia/Jakarta");
});

test("dashboard date uses the configured application timezone", () => {
  const instant = new Date("2026-11-20T17:30:00.000Z");
  assert.deepEqual(getDashboardDateParts(instant, "Asia/Jakarta"), {
    date: "2026-11-21",
    time: "00:30:00",
  });
});

test("today lessons include Scheduled and Completed but not Cancelled", () => {
  assert.equal(isTodaysLessonStatus("Scheduled"), true);
  assert.equal(isTodaysLessonStatus("Completed"), true);
  assert.equal(isTodaysLessonStatus("Cancelled"), false);
});

test("upcoming starts tomorrow and only includes Scheduled", () => {
  assert.equal(isUpcomingDashboardSchedule({ scheduledDate: "2026-11-21", dashboardDate: "2026-11-20", status: "Scheduled" }), true);
  assert.equal(isUpcomingDashboardSchedule({ scheduledDate: "2026-11-20", dashboardDate: "2026-11-20", status: "Scheduled" }), false);
  assert.equal(isUpcomingDashboardSchedule({ scheduledDate: "2026-11-22", dashboardDate: "2026-11-20", status: "Completed" }), false);
});

test("overdue applies only to Scheduled lessons today", () => {
  assert.equal(isOverdueDashboardSchedule({ scheduledDate: "2026-11-20", dashboardDate: "2026-11-20", endTime: "09:00:00", currentTime: "10:00:00", status: "Scheduled" }), true);
  assert.equal(isOverdueDashboardSchedule({ scheduledDate: "2026-11-20", dashboardDate: "2026-11-20", endTime: "09:00:00", currentTime: "10:00:00", status: "Completed" }), false);
});

