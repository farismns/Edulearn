import SummaryCard from "@/features/dashboard/components/SummaryCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to EduLearn
        </h1>
        <p className="mt-1 text-sm text-secondary-text">
          Here is an overview of your tutoring activities.
        </p>
      </div>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard title="Total Students" value={24} />

          <SummaryCard title="Today's Lessons" value={3} />
        </div>
      </section>
    </div>
  );
}
