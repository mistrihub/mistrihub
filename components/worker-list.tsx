import type { Worker } from "@/types/worker";
import { WorkerCard } from "@/components/worker-card";

export function WorkerList({ workers }: { workers: Worker[] }) {
  if (workers.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-bold text-ink">No workers found</h3>
        <p className="mt-2 text-sm text-slate-600">Try another category, area, or rating filter.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {workers.map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}

