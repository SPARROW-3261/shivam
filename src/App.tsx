import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { TrackingModal } from './components/common/TrackingModal.tsx';

// Pages
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { WardenDashboard } from './pages/WardenDashboard.tsx';
import { HODDashboard } from './pages/HODDashboard.tsx';
import { DeanDashboard } from './pages/DeanDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage.tsx';
import { ComplaintsListPage } from './pages/ComplaintsListPage.tsx';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage.tsx';
import { UserManagementPage } from './pages/UserManagementPage.tsx';
import { RoutingRulesPage } from './pages/RoutingRulesPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SystemDatabasePage } from './pages/SystemDatabasePage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import type { Complaint } from './types/index.ts';

function AppContent() {
  const { role, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [trackingModalId, setTrackingModalId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user requests to open a complaint detail dossier
  const handleOpenComplaint = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
  };

  // If user requests public tracking popup
  const handleOpenTracker = (id: string) => {
    setTrackingModalId(id);
  };

  // Navigate handler that clears any open detail view
  const handleNavigate = (page: string) => {
    setSelectedComplaintId(null);
    setCurrentPage(page);
  };

  // If on login/auth page
  if (currentPage === 'auth') {
    return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (role) {
      case 'warden':
        return (
          <WardenDashboard
            onOpenComplaint={handleOpenComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'hod':
        return (
          <HODDashboard
            onOpenComplaint={handleOpenComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'dean':
        return (
          <DeanDashboard
            onOpenComplaint={handleOpenComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            onOpenComplaint={handleOpenComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'student':
      default:
        return (
          <StudentDashboard
            onNavigate={handleNavigate}
            onOpenComplaint={handleOpenComplaint}
            onOpenTracker={handleOpenTracker}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        closeMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenTracker={handleOpenTracker}
          onNavigate={handleNavigate}
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {selectedComplaintId ? (
            <ComplaintDetailPage
              complaintId={selectedComplaintId}
              onBack={() => setSelectedComplaintId(null)}
              onRefreshList={() => {}}
            />
          ) : (
            <>
              {currentPage === 'dashboard' && renderDashboard()}
              {currentPage === 'submit-complaint' && (
                <SubmitComplaintPage
                  onSuccess={(id) => {
                    setSelectedComplaintId(id);
                  }}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === 'complaints' && (
                <ComplaintsListPage
                  onOpenComplaint={handleOpenComplaint}
                  onOpenTracker={handleOpenTracker}
                />
              )}
              {currentPage === 'public-tracker' && (
                <div className="max-w-2xl mx-auto py-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Live Public Grievance Tracker</h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Any student, parent, or campus official can track real-time resolution progress and notes using the
                      official tracking token without logging in.
                    </p>
                    <button
                      onClick={() => handleOpenTracker('HC-2026-1041')}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Open Live Tracker Dialog
                    </button>
                  </div>
                </div>
              )}
              {currentPage === 'users' && <UserManagementPage />}
              {currentPage === 'routing' && <RoutingRulesPage />}
              {currentPage === 'reports' && <ReportsPage />}
              {currentPage === 'database' && <SystemDatabasePage />}
              {currentPage === 'profile' && <ProfilePage />}
            </>
          )}
        </main>
      </div>

      {/* Live Public Tracking Modal */}
      {trackingModalId && (
        <TrackingModal
          complaintId={trackingModalId}
          onClose={() => setTrackingModalId(null)}
          onSelectComplaint={(complaint) => {
            setSelectedComplaintId(complaint.id);
            setTrackingModalId(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
