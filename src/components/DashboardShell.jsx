import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const DashboardShell = ({ role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define Navigation Items per Role
  const adminNav = [
    { section: 'Overview' },
    { path: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { section: 'Gym Operations' },
    { path: '/admin/members', icon: 'bi-people', label: 'Members Roster' },
    { path: '/admin/trainers', icon: 'bi-person-badge', label: 'Trainers Staff' },
    { path: '/admin/membership-plans', icon: 'bi-tag', label: 'Membership Plans' },
    { path: '/admin/memberships', icon: 'bi-card-checklist', label: 'Subscriptions' },
    { section: 'Financial & Records' },
    { path: '/admin/payments', icon: 'bi-credit-card-2-front', label: 'Payments' },
    { path: '/admin/attendance', icon: 'bi-calendar-check', label: 'Attendance' },
    { path: '/admin/assignments', icon: 'bi-person-lines-fill', label: 'Allocations' },
    { path: '/admin/sessions', icon: 'bi-stopwatch', label: 'Training Sessions' },
  ];

  const memberNav = [
    { section: 'My Hub' },
    { path: '/member/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { path: '/member/my-membership', icon: 'bi-card-checklist', label: 'My Membership' },
    { path: '/member/plans', icon: 'bi-tags', label: 'Explore Plans' },
    { path: '/member/payments', icon: 'bi-receipt', label: 'Payment Receipts' },
    { section: 'Fitness & Routine' },
    { path: '/member/attendance', icon: 'bi-calendar-check', label: 'My Attendance' },
    { path: '/member/workouts', icon: 'bi-lightning-charge', label: 'My Workout Routine' },
    { path: '/member/progress', icon: 'bi-graph-up', label: 'Fitness Metrics' },
    { section: 'Training Sessions' },
    { path: '/member/book-session', icon: 'bi-calendar-plus', label: 'Book a Trainer' },
    { path: '/member/sessions', icon: 'bi-stopwatch', label: 'My Sessions' },
    { path: '/member/profile', icon: 'bi-person-gear', label: 'My Profile' },
  ];

  const trainerNav = [
    { section: 'Overview' },
    { path: '/trainer/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { section: 'Client Management' },
    { path: '/trainer/members', icon: 'bi-people', label: 'Assigned Clients' },
    { path: '/trainer/workout-plans', icon: 'bi-journal-richtext', label: 'Workout Plans' },
    { path: '/trainer/workout-plans/new', icon: 'bi-plus-circle', label: 'Create New Plan' },
    { section: 'Scheduling' },
    { path: '/trainer/availability', icon: 'bi-calendar-range', label: 'Manage Availability' },
    { path: '/trainer/sessions', icon: 'bi-stopwatch', label: 'Training Sessions' },
    { path: '/trainer/profile', icon: 'bi-person-badge', label: 'Trainer Profile' },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'TRAINER' ? trainerNav : memberNav;
  const roleBadge = role === 'ADMIN' ? 'ADMIN CONSOLE' : role === 'TRAINER' ? 'TRAINER SUITE' : 'MEMBER PORTAL';
  const roleColor = role === 'ADMIN' ? 'bg-danger-subtle text-danger border-danger-subtle' : role === 'TRAINER' ? 'bg-info-subtle text-info border-info-subtle' : 'bg-success-subtle text-success border-success-subtle';

  return (
    <div className="dashboard-shell">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)}></div>
      )}

      {/* Modern Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? 'show-mobile' : ''}`}>
        <Link to="/" className="sidebar-brand">
          <div className="rounded-2 d-flex align-items-center justify-content-center text-white" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', width: '34px', height: '34px' }}>
            <i className="bi bi-activity fs-6"></i>
          </div>
          <div>
            <div className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Smart<span className="text-primary">Gym</span>
            </div>
            <span className={`badge border ${roleColor} mt-1`} style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>
              {roleBadge}
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="sidebar-nav-container">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer with User Info & Logout */}
        <div className="sidebar-footer">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '34px', height: '34px', minWidth: '34px' }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-truncate">
                <div className="fw-semibold text-dark small text-truncate">{user?.fullName || 'User'}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user?.email || ''}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger p-1 rounded-2"
              title="Sign Out"
              style={{ width: '30px', height: '30px' }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm btn-outline-secondary d-lg-none p-1 px-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="d-none d-md-flex align-items-center gap-2 text-secondary small">
              <i className="bi bi-calendar3 text-primary"></i>
              <span>{formatDate(new Date())}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-sm btn-gym-outline d-none d-sm-inline-flex" title="View Public Landing Page">
              <i className="bi bi-globe me-1"></i> Public Site
            </Link>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>
                <i className="bi bi-person-fill"></i>
              </div>
              <span className="fw-medium text-dark small d-none d-sm-inline">
                {user?.fullName || 'Account'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
