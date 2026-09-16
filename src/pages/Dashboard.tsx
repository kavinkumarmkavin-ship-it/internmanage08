import { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Internship, ApplicationStatus } from '@/types';
import type { Page } from '@/App';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface StatusCard {
  label: string;
  status: ApplicationStatus | 'total';
  icon: typeof Briefcase;
  color: string;
  bg: string;
  ring: string;
}

const statusCards: StatusCard[] = [
  { label: 'Total Applications', status: 'total', icon: Briefcase, color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  { label: 'Shortlisted', status: 'Shortlisted', icon: Users, color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  { label: 'Interview', status: 'Interview', icon: Clock, color: 'text-purple-700', bg: 'bg-purple-50', ring: 'ring-purple-200' },
  { label: 'Selected', status: 'Selected', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { label: 'Rejected', status: 'Rejected', icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  async function fetchInternships() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setInternships(data || []);
    }
    setLoading(false);
  }

  const counts = {
    total: internships.length,
    Shortlisted: internships.filter((i) => i.application_status === 'Shortlisted').length,
    Interview: internships.filter((i) => i.application_status === 'Interview').length,
    Selected: internships.filter((i) => i.application_status === 'Selected').length,
    Rejected: internships.filter((i) => i.application_status === 'Rejected').length,
  };

  const recent = internships.slice(0, 5);
  const successRate = internships.length > 0
    ? Math.round((counts.Selected / internships.length) * 100)
    : 0;

  return (
    <div className="pt-14 lg:pt-0 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your internship applications at a glance</p>
        </div>
        <button
          onClick={() => onNavigate('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Application
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          const value = card.status === 'total' ? counts.total : counts[card.status as keyof typeof counts];
          return (
            <div
              key={card.label}
              className={`${card.bg} ring-1 ${card.ring} rounded-2xl p-5 transition-transform hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{loading ? '–' : value}</p>
              <p className="text-sm text-slate-600 mt-1 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Success Rate + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-600">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{successRate}%</p>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {internships.filter((i) => ['Applied', 'Shortlisted', 'Interview'].includes(i.application_status)).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">Active applications</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-600">Completed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {internships.filter((i) => i.application_status === 'Completed').length}
          </p>
          <p className="text-sm text-slate-500 mt-1">Finished internships</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Applications</h2>
          <button
            onClick={() => onNavigate('applications')}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No applications yet</p>
            <button
              onClick={() => onNavigate('add')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-600">
                    {item.student_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.company_name}</p>
                  <p className="text-sm text-slate-500 truncate">{item.internship_role} · {item.student_name}</p>
                </div>
                <StatusBadge status={item.application_status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, string> = {
    Applied: 'bg-blue-100 text-blue-700',
    Shortlisted: 'bg-amber-100 text-amber-700',
    Interview: 'bg-purple-100 text-purple-700',
    Selected: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
    Completed: 'bg-slate-200 text-slate-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]} flex-shrink-0`}>
      {status}
    </span>
  );
}
