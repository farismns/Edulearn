export const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isValidTimeRange = (startTime, endTime) =>
  timeToMinutes(endTime) > timeToMinutes(startTime);

export const timesOverlap = (startA, endA, startB, endB) =>
  timeToMinutes(startA) < timeToMinutes(endB) &&
  timeToMinutes(endA) > timeToMinutes(startB);

export const isOverdue = ({ scheduledDate, endTime, today, currentTime }) => {
  if (scheduledDate < today) return true;
  if (scheduledDate > today) return false;
  const now = currentTime ?? new Date().toTimeString().slice(0, 5);
  return timeToMinutes(endTime) < timeToMinutes(now);
};

export const classifySchedule = ({ scheduledDate, status, endTime, today, currentTime }) => {
  const overdue = status === "Scheduled" && isOverdue({ scheduledDate, endTime, today, currentTime });
  const tab = scheduledDate < today || status === "Completed" || status === "Cancelled" || overdue
    ? "Past"
    : "Upcoming";
  return { tab, overdue };
};

export const getEditRestriction = (status, hasLearningRecord) => {
  if (status === "Completed") return "Completed schedules cannot be edited.";
  if (status === "Cancelled") return "Cancelled schedules are view-only.";
  if (hasLearningRecord) return "Schedules with learning records cannot be edited.";
  return null;
};

