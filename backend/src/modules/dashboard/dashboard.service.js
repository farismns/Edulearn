import * as repository from "./dashboard.repository.js";
import { getApplicationTimeZone, getDashboardDateParts } from "./dashboard.policy.js";

export const getDashboard = async (userId, now = new Date()) => {
  const timeZone = getApplicationTimeZone();
  const dateParts = getDashboardDateParts(now, timeZone);
  const data = await repository.getDashboardData({
    userId,
    dashboardDate: dateParts.date,
    dashboardTime: dateParts.time,
  });
  return { ...data, date: dateParts.date, timeZone };
};

