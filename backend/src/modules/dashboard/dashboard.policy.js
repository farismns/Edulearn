export const DEFAULT_APPLICATION_TIME_ZONE = "Asia/Jakarta";

export const getApplicationTimeZone = () =>
  process.env.EDULEARN_TIME_ZONE || DEFAULT_APPLICATION_TIME_ZONE;

export const getDashboardDateParts = (value = new Date(), timeZone = getApplicationTimeZone()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "iso8601",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value).reduce((result, part) => {
    if (part.type !== "literal") result[part.type] = part.value;
    return result;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}:${parts.second}`,
  };
};

export const isTodaysLessonStatus = (status) =>
  status === "Scheduled" || status === "Completed";

export const isUpcomingDashboardSchedule = ({ scheduledDate, dashboardDate, status }) =>
  scheduledDate > dashboardDate && status === "Scheduled";

export const isOverdueDashboardSchedule = ({ scheduledDate, dashboardDate, endTime, currentTime, status }) =>
  scheduledDate === dashboardDate && status === "Scheduled" && endTime < currentTime;

