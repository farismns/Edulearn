import test from "node:test";
import assert from "node:assert/strict";
import { getSubjectDeletionBlockReason } from "../src/modules/subjects/subject.deletion.policy.js";

test("snapshot references block deletion after student assignment removal", () => {
  const reason = getSubjectDeletionBlockReason({
    completedLessonCount: 0,
    activeScheduleCount: 0,
    snapshotReferenceCount: 1,
    untrackedSnapshotCount: 0,
    affectedStudents: [],
  });

  assert.equal(reason, "snapshot_reference");
});

test("legacy snapshots without normalized references conservatively block deletion", () => {
  const reason = getSubjectDeletionBlockReason({
    completedLessonCount: 0,
    activeScheduleCount: 0,
    snapshotReferenceCount: 0,
    untrackedSnapshotCount: 1,
  });

  assert.equal(reason, "untracked_snapshot_reference");
});

