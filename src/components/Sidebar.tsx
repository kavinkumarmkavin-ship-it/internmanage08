import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  BarChart3,
  Info,
  GraduationCap,
} from 'lucide-react';
import type { Page } from '@/App';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add', label: 'Add Internship', icon: PlusCircle },
  { id: 'applications', label: 'Applications', icon: Briefcase },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'about', label: 'About', icon: Info },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <GraduationCap className="w-7 h-7 text-emerald-400" />
        <span className="font-bold text-lg tracking-tight">InternHub</span>
        <div className="ml-auto flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 flex-col bg-slate-900 text-white z-40">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">InternHub</h1>
            <p className="text-xs text-slate-400">Internship Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            Student Internship
            <br />
            Management System
          </p>
        </div>
      </aside>
    </>
  );
}
