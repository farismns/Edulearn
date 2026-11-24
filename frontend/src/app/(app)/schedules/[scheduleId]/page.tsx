import { Suspense, use } from "react";

export default function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ scheduleId: string }>;
}) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Schedule Details</h1>
      <Suspense fallback={<p className="mt-4">Loading schedule...</p>}>
        <ScheduleId params={params} />
      </Suspense>
    </main>
  );
}

function ScheduleId({
  params,
}: {
  params: Promise<{ scheduleId: string }>;
}) {
  const { scheduleId } = use(params);

  return <p className="mt-4">Schedule ID: {scheduleId}</p>;
}
