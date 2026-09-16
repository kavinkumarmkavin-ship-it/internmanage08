import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import AddInternship from '@/pages/AddInternship';
import Applications from '@/pages/Applications';
import Reports from '@/pages/Reports';
import About from '@/pages/About';

export type Page = 'dashboard' | 'add' | 'applications' | 'reports' | 'about';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);

  function navigate(p: Page) {
    if (p !== 'add') setEditingId(null);
    setPage(p);
  }

  function startEdit(id: string) {
    setEditingId(id);
    setPage('add');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentPage={page} onNavigate={navigate} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'add' && (
            <AddInternship
              onNavigate={navigate}
              editingId={editingId}
              onEditComplete={() => { setEditingId(null); setPage('applications'); }}
            />
          )}
          {page === 'applications' && <Applications onNavigate={navigate} onEdit={startEdit} />}
          {page === 'reports' && <Reports />}
          {page === 'about' && <About />}
        </div>
      </main>
    </div>
  );
}

export default App;
