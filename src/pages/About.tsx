import {
  GraduationCap,
  Briefcase,
  BarChart3,
  Search,
  ShieldCheck,
  Database,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function About() {
  return (
    <div className="pt-14 lg:pt-0 space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">About</h1>
        <p className="text-slate-500 mt-1">Student Internship Management System</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">InternHub</h2>
            <p className="text-slate-400 text-sm">Internship Management System</p>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed">
          A full-stack CRUD web application that helps students manage their internship applications
          and track application status — from first submission to final selection. Built with React,
          TypeScript, Tailwind CSS, and a Supabase (PostgreSQL) backend.
        </p>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureItem icon={Briefcase} title="Full CRUD Operations" desc="Create, read, update, and delete internship applications with real database persistence." />
          <FeatureItem icon={BarChart3} title="Analytics Dashboard" desc="Summary cards and visual reports showing status distribution, department breakdowns, and company statistics." />
          <FeatureItem icon={Search} title="Search & Filter" desc="Search by student, company, or role. Filter by department and status. Sort by application date." />
          <FeatureItem icon={ShieldCheck} title="Data Validation" desc="Client-side and server-side validation for required fields, email format, and numeric stipend." />
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TechItem icon={Layers} label="Frontend" value="React 18 + TypeScript + Tailwind CSS" />
          <TechItem icon={Database} label="Backend & Database" value="Supabase (PostgreSQL) with REST API" />
          <TechItem icon={Briefcase} label="Icons" value="Lucide React" />
          <TechItem icon={ShieldCheck} label="Security" value="Row Level Security (RLS) policies" />
        </div>
      </div>

      {/* CRUD Operations */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">CRUD Operations</h3>
        <div className="space-y-2">
          <CrudItem method="POST" path="/internships" desc="Create a new internship application" />
          <CrudItem method="GET" path="/internships" desc="Retrieve all internship applications" />
          <CrudItem method="GET" path="/internships/{id}" desc="Retrieve a single application by ID" />
          <CrudItem method="PUT" path="/internships/{id}" desc="Update an entire application record" />
          <CrudItem method="PATCH" path="/internships/{id}" desc="Partially update an application" />
          <CrudItem method="DELETE" path="/internships/{id}" desc="Delete an application (with confirmation)" />
        </div>
      </div>

      {/* Application Statuses */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Application Statuses</h3>
        <div className="flex flex-wrap gap-2">
          {['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Completed'].map((s) => (
            <span key={s} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-sm text-slate-400">
          Student Internship Management System · Built for college project demonstration
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: typeof Briefcase; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <p className="font-medium text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function TechItem({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
      <Icon className="w-5 h-5 text-slate-500 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function CrudItem({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-emerald-100 text-emerald-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-purple-100 text-purple-700',
    DELETE: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${methodColors[method]} flex-shrink-0`}>
        {method}
      </span>
      <code className="text-sm text-slate-700 font-mono">{path}</code>
      <span className="text-xs text-slate-400 ml-auto hidden sm:block">{desc}</span>
    </div>
  );
}
