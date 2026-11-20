// Parent Report generation should call this in the same transaction that
// creates the immutable snapshot. The copied name preserves historical
// display data even if the Subject is renamed later.
export const recordSnapshotSubjectReferences = async ({ client, snapshotId, userId, subjectIds }) => {
  const result = await client.query(
    `INSERT INTO edulearn.parent_report_snapshot_subjects
       (snapshot_id, subject_id, subject_name_snapshot)
     SELECT $1, sub.id, sub.name
     FROM edulearn.subjects sub
     JOIN edulearn.parent_report_snapshots prs ON prs.id = $1
     JOIN edulearn.parent_reports pr ON pr.id = prs.parent_report_id
     JOIN edulearn.students st ON st.id = pr.student_id AND st.user_id = $2
     WHERE sub.user_id = $2 AND sub.id = ANY($3::bigint[])
     ON CONFLICT (snapshot_id, subject_id) DO NOTHING
     RETURNING subject_id`,
    [snapshotId, userId, subjectIds],
  );

  if (result.rowCount !== subjectIds.length) {
    throw new Error("Unable to record all parent report subject references.");
  }

  return result.rows.map((row) => String(row.subject_id));
};

