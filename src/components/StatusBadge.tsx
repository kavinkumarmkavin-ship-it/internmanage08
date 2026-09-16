import type { ApplicationStatus } from '@/types';

const colors: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-amber-100 text-amber-700',
  Interview: 'bg-purple-100 text-purple-700',
  Selected: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Completed: 'bg-slate-200 text-slate-700',
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]} whitespace-nowrap`}>
      {status}
    </span>
  );
}
