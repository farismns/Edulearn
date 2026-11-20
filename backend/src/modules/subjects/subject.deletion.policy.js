export const getSubjectDeletionBlockReason = ({
  completedLessonCount,
  activeScheduleCount,
  snapshotReferenceCount,
  untrackedSnapshotCount,
}) => {
  if (completedLessonCount > 2) return "completed_lessons";
  if (activeScheduleCount > 0) return "active_schedule";
  if (snapshotReferenceCount > 0) return "snapshot_reference";
  if (untrackedSnapshotCount > 0) return "untracked_snapshot_reference";
  return null;
};

