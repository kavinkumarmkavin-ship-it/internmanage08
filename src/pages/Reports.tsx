import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Building2, MapPin, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STATUS_OPTIONS, DEPARTMENTS, type Internship, type ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-500',
  Shortlisted: 'bg-amber-500',
  Interview: 'bg-purple-500',
  Selected: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
  Completed: 'bg-slate-500',
};

export default function Reports() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  async function fetchInternships() {
    setLoading(true);
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('application_date', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setInternships(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="pt-14 lg:pt-0 p-8 text-center text-slate-400">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="pt-14 lg:pt-0">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  // Status distribution
  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = internships.filter((i) => i.application_status === s).length;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  // Department distribution
  const deptCounts = DEPARTMENTS.map((d) => ({
    dept: d,
    count: internships.filter((i) => i.department === d).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const maxDept = Math.max(...deptCounts.map((d) => d.count), 1);

  // Top companies
  const companyMap = new Map<string, number>();
  internships.forEach((i) => {
    companyMap.set(i.company_name, (companyMap.get(i.company_name) || 0) + 1);
  });
  const topCompanies = Array.from(companyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Location distribution
  const locationMap = new Map<string, number>();
  internships.forEach((i) => {
    if (i.location) locationMap.set(i.location, (locationMap.get(i.location) || 0) + 1);
  });
  const topLocations = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Stats
  const totalStipend = internships.reduce((sum, i) => sum + Number(i.stipend), 0);
  const avgStipend = internships.length > 0 ? Math.round(totalStipend / internships.length) : 0;
  const selectedCount = statusCounts.Selected;
  const successRate = internships.length > 0 ? Math.round((selectedCount / internships.length) * 100) : 0;

  return (
    <div className="pt-14 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Insights into your internship applications</p>
      </div>

      {internships.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No data available for reports yet. Add some applications first!</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={BarChart3} label="Total Applications" value={internships.length} color="text-blue-600 bg-blue-50" />
            <MetricCard icon={Award} label="Selected" value={selectedCount} color="text-emerald-600 bg-emerald-50" />
            <MetricCard icon={TrendingUp} label="Success Rate" value={`${successRate}%`} color="text-amber-600 bg-amber-50" />
            <MetricCard icon={Building2} label="Avg. Stipend" value={`₹${avgStipend.toLocaleString('en-IN')}`} color="text-purple-600 bg-purple-50" />
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Application Status Distribution</h2>
            <div className="space-y-3">
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-24 flex-shrink-0">{status}</span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status]} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max((statusCounts[status] / maxStatus) * 100, statusCounts[status] > 0 ? 8 : 0)}%` }}
                    >
                      {statusCounts[status] > 0 && (
                        <span className="text-xs font-bold text-white">{statusCounts[status]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Applications by Department</h2>
              <div className="space-y-3">
                {deptCounts.map(({ dept, count }) => (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-32 flex-shrink-0 truncate" title={dept}>{dept}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max((count / maxDept) * 100, count > 0 ? 12 : 0)}%` }}
                      >
                        {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Companies */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Top Companies Applied To</h2>
              {topCompanies.length === 0 ? (
                <p className="text-sm text-slate-400">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topCompanies.map(([company, count], idx) => (
                    <div key={company} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{company}</span>
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              Top Locations
            </h2>
            {topLocations.length === 0 ? (
              <p className="text-sm text-slate-400">No location data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {topLocations.map(([location, count]) => (
                  <div key={location} className="bg-slate-50 rounded-xl p-4 text-center">
                    <MapPin className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700 truncate" title={location}>{location}</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: typeof BarChart3; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}
