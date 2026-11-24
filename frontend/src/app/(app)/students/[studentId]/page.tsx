import { Suspense, use } from "react";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Student Details</h1>
      <Suspense fallback={<p className="mt-4">Loading student...</p>}>
        <StudentId params={params} />
      </Suspense>
    </main>
  );
}

function StudentId({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  return <p className="mt-4">Student ID: {studentId}</p>;
}
