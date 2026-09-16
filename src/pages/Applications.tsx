import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  Briefcase,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  STATUS_OPTIONS,
  DEPARTMENTS,
  type Internship,
  type ApplicationStatus,
} from '@/types';
import StatusBadge from '@/components/StatusBadge';
import type { Page } from '@/App';

interface ApplicationsProps {
  onNavigate: (page: Page) => void;
  onEdit: (id: string) => void;
}

type SortOrder = 'asc' | 'desc';

export default function Applications({ onNavigate, onEdit }: ApplicationsProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'application_date' | 'company_name' | 'student_name'>('application_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState<Internship | null>(null);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (error) {
      setError(error.message);
    } else {
      setInternships(data || []);
    }
    setLoading(false);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  function toggleSort(field: typeof sortBy) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      setError(error.message);
    } else {
      setInternships((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  }

  const filtered = internships.filter((item) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.student_name.toLowerCase().includes(searchLower) ||
      item.company_name.toLowerCase().includes(searchLower) ||
      item.internship_role.toLowerCase().includes(searchLower);
    const matchesDept = !filterDept || item.department === filterDept;
    const matchesStatus = !filterStatus || item.application_status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const hasFilters = search || filterDept || filterStatus;

  return (
    <div className="pt-14 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 mt-1">Manage all your internship applications</p>
        </div>
        <button
          onClick={() => onNavigate('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add New
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, company, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setFilterDept(''); setFilterStatus(''); }}
              className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {hasFilters ? 'No applications match your filters.' : 'No applications yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      <button onClick={() => toggleSort('student_name')} className="flex items-center gap-1 hover:text-slate-900">
                        Student
                        {sortBy === 'student_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      <button onClick={() => toggleSort('company_name')} className="flex items-center gap-1 hover:text-slate-900">
                        Company
                        {sortBy === 'company_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Dept</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      <button onClick={() => toggleSort('application_date')} className="flex items-center gap-1 hover:text-slate-900">
                        Date
                        {sortBy === 'application_date' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.student_name}</div>
                        <div className="text-xs text-slate-400">{item.student_email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.company_name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.internship_role}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.department}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.application_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.application_status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewTarget(item)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-50">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.student_name}</p>
                      <p className="text-sm text-slate-500">{item.company_name} · {item.internship_role}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.department} · {new Date(item.application_date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <StatusBadge status={item.application_status} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setViewTarget(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Search className="w-3 h-3" /> View
                    </button>
                    <button
                      onClick={() => onEdit(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-sm text-slate-400 text-center">
          Showing {filtered.length} application{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Delete Application?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to delete the application for{' '}
                  <span className="font-medium text-slate-700">{deleteTarget.student_name}</span> at{' '}
                  <span className="font-medium text-slate-700">{deleteTarget.company_name}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Application Details</h3>
              <button onClick={() => setViewTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <DetailRow label="Student Name" value={viewTarget.student_name} />
              <DetailRow label="Student Email" value={viewTarget.student_email} />
              <DetailRow label="Department" value={viewTarget.department} />
              <DetailRow label="Company" value={viewTarget.company_name} />
              <DetailRow label="Role" value={viewTarget.internship_role} />
              <DetailRow label="Location" value={viewTarget.location || '—'} />
              <DetailRow label="Duration" value={viewTarget.duration} />
              <DetailRow label="Stipend" value={`₹${viewTarget.stipend.toLocaleString('en-IN')}`} />
              <DetailRow label="Application Date" value={new Date(viewTarget.application_date).toLocaleDateString('en-IN')} />
              <DetailRow label="Status" value={viewTarget.application_status} />
              <DetailRow label="Skills Required" value={viewTarget.skills_required || '—'} />
              <DetailRow label="Remarks" value={viewTarget.remarks || '—'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}
