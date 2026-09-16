import { useEffect, useState } from 'react';
import { Save, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  STATUS_OPTIONS,
  DEPARTMENTS,
  type Internship,
  type InternshipInput,
  type ApplicationStatus,
} from '@/types';
import type { Page } from '@/App';

interface AddInternshipProps {
  onNavigate: (page: Page) => void;
  editingId?: string | null;
  onEditComplete?: () => void;
}

interface FormErrors {
  student_name?: string;
  student_email?: string;
  department?: string;
  company_name?: string;
  internship_role?: string;
  duration?: string;
  stipend?: string;
  application_date?: string;
  application_status?: string;
}

const emptyForm: InternshipInput = {
  student_name: '',
  student_email: '',
  department: DEPARTMENTS[0],
  company_name: '',
  internship_role: '',
  location: '',
  duration: '',
  stipend: 0,
  application_date: new Date().toISOString().split('T')[0],
  application_status: 'Applied',
  skills_required: '',
  remarks: '',
};

export default function AddInternship({ onNavigate, editingId, onEditComplete }: AddInternshipProps) {
  const isEditing = Boolean(editingId);
  const [form, setForm] = useState<InternshipInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingId) {
      loadInternship(editingId);
    }
  }, [editingId]);

  async function loadInternship(id: string) {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      setSubmitError('Could not load application for editing.');
      return;
    }

    const internship = data as Internship;
    setForm({
      student_name: internship.student_name,
      student_email: internship.student_email,
      department: internship.department,
      company_name: internship.company_name,
      internship_role: internship.internship_role,
      location: internship.location || '',
      duration: internship.duration,
      stipend: internship.stipend,
      application_date: internship.application_date,
      application_status: internship.application_status,
      skills_required: internship.skills_required || '',
      remarks: internship.remarks || '',
    });
  }

  function validate(): boolean {
    const e: FormErrors = {};

    if (!form.student_name.trim()) e.student_name = 'Student name is required.';
    if (!form.student_email.trim()) {
      e.student_email = 'Email is required.';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.student_email)) {
      e.student_email = 'Please enter a valid email address.';
    }
    if (!form.department.trim()) e.department = 'Department is required.';
    if (!form.company_name.trim()) e.company_name = 'Company name is required.';
    if (!form.internship_role.trim()) e.internship_role = 'Internship role is required.';
    if (!form.duration.trim()) e.duration = 'Duration is required.';
    if (form.stipend < 0) e.stipend = 'Stipend cannot be negative.';
    if (isNaN(form.stipend)) e.stipend = 'Stipend must be a number.';
    if (!form.application_date) e.application_date = 'Application date is required.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function update<K extends keyof InternshipInput>(key: K, value: InternshipInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      ...form,
      stipend: Number(form.stipend),
      skills_required: form.skills_required.trim(),
      remarks: form.remarks.trim(),
      location: form.location.trim(),
    };

    if (isEditing && editingId) {
      const { error } = await supabase
        .from('internships')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        if (onEditComplete) {
          onEditComplete();
        } else {
          onNavigate('applications');
        }
      }, 1000);
    } else {
      const { error } = await supabase.from('internships').insert(payload);

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        setForm(emptyForm);
        setSuccess(false);
        onNavigate('applications');
      }, 1000);
    }
  }

  const inputClass = (field: keyof FormErrors | 'location' | 'skills_required' | 'remarks') =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
      errors[field as keyof FormErrors]
        ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
        : 'border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
    } outline-none`;

  return (
    <div className="pt-14 lg:pt-0 space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => (onEditComplete ? onEditComplete() : onNavigate('applications'))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Application' : 'Add Internship Application'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Update the application details below' : 'Fill in the details of your new internship application'}
          </p>
        </div>
      </div>

      {submitError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {isEditing ? 'Application updated successfully!' : 'Application added successfully!'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {/* Student Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full" />
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.student_name}
                onChange={(e) => update('student_name', e.target.value)}
                className={inputClass('student_name')}
                placeholder="e.g. John Doe"
              />
              {errors.student_name && <p className="text-xs text-rose-500 mt-1">{errors.student_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Student Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={form.student_email}
                onChange={(e) => update('student_email', e.target.value)}
                className={inputClass('student_email')}
                placeholder="e.g. john.doe@university.edu"
              />
              {errors.student_email && <p className="text-xs text-rose-500 mt-1">{errors.student_email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                className={inputClass('department')}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-rose-500 mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Application Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.application_date}
                onChange={(e) => update('application_date', e.target.value)}
                className={inputClass('application_date')}
              />
              {errors.application_date && <p className="text-xs text-rose-500 mt-1">{errors.application_date}</p>}
            </div>
          </div>
        </div>

        {/* Internship Details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full" />
            Internship Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                className={inputClass('company_name')}
                placeholder="e.g. Google India"
              />
              {errors.company_name && <p className="text-xs text-rose-500 mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Internship Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.internship_role}
                onChange={(e) => update('internship_role', e.target.value)}
                className={inputClass('internship_role')}
                placeholder="e.g. Software Engineer Intern"
              />
              {errors.internship_role && <p className="text-xs text-rose-500 mt-1">{errors.internship_role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass('location')}
                placeholder="e.g. Bangalore, India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
                className={inputClass('duration')}
                placeholder="e.g. 3 months"
              />
              {errors.duration && <p className="text-xs text-rose-500 mt-1">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Stipend (numeric) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={form.stipend}
                onChange={(e) => update('stipend', Number(e.target.value))}
                className={inputClass('stipend')}
                placeholder="e.g. 15000"
                min="0"
              />
              {errors.stipend && <p className="text-xs text-rose-500 mt-1">{errors.stipend}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Application Status
              </label>
              <select
                value={form.application_status}
                onChange={(e) => update('application_status', e.target.value as ApplicationStatus)}
                className={inputClass('application_status')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Skills Required
              </label>
              <input
                type="text"
                value={form.skills_required}
                onChange={(e) => update('skills_required', e.target.value)}
                className={inputClass('skills_required')}
                placeholder="e.g. Python, SQL, React, Communication"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Remarks
              </label>
              <textarea
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                rows={3}
                className={inputClass('remarks')}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : isEditing ? 'Update Application' : 'Save Application'}
          </button>
          <button
            type="button"
            onClick={() => (onEditComplete ? onEditComplete() : onNavigate('dashboard'))}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
