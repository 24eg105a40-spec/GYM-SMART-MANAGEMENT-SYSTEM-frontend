import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { paymentApi } from '../../api/paymentApi';
import { memberApi } from '../../api/memberApi';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter state for Dashboard Users Table
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // History Modal State
  const [historyModal, setHistoryModal] = useState({ show: false, member: null, history: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      setError('');
      const [statsData, allUsersData] = await Promise.all([
        dashboardApi.getAdminDashboard(),
        memberApi.getAllMembers().catch(() => []),
      ]);

      const resolvedStats = statsData?.data || statsData || null;
      setStats(resolvedStats);

      // Prefer live list of users from memberApi, or fallback to stats.recentUsers
      const resolvedUsers = Array.isArray(allUsersData) && allUsersData.length > 0
        ? allUsersData
        : (resolvedStats?.recentUsers || []);
      setUsers(resolvedUsers);

      if (isManualRefresh) {
        setActionSuccess('Dashboard and user records refreshed with latest database state.');
      }
    } catch (err) {
      setError('Failed to fetch administrator statistics from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyPayment = async (paymentId) => {
    setActionLoading(true);
    setActionSuccess('');
    setError('');

    try {
      await paymentApi.verifyPayment(paymentId);
      setActionSuccess(`Payment #${paymentId} verified successfully! Associated membership activated.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    setActionLoading(true);
    setActionSuccess('');
    setError('');

    try {
      await memberApi.updateMemberStatus(userId, !currentActive);
      setActionSuccess(`User #${userId} account status updated to ${!currentActive ? 'Active' : 'Suspended'}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user account status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHistory = async (member) => {
    setHistoryModal({ show: true, member, history: [] });
    setHistoryLoading(true);
    try {
      const history = await memberApi.getMemberHistory(member.id);
      setHistoryModal({
        show: true,
        member,
        history: Array.isArray(history) ? history : (history?.data || []),
      });
    } catch (err) {
      console.error('Failed to load member history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating real gym statistics and loading user records from MySQL..." />;
  }

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge bg-danger text-white small">ADMIN</span>;
      case 'TRAINER':
        return <span className="badge bg-info text-dark small">TRAINER</span>;
      default:
        return <span className="badge bg-primary text-white small">MEMBER</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">System Administration Dashboard</h1>
          <p className="dashboard-subtitle">
            Real-time gym metrics, registered user profiles, and subscription records.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-gym-outline btn-sm py-2 px-3"
            onClick={() => loadData(true)}
            disabled={refreshing || actionLoading}
            title="Refresh latest data from database"
          >
            <i className={`bi bi-arrow-clockwise me-1 ${refreshing ? 'spin-anim' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link to="/admin/memberships" className="btn btn-gym-primary btn-sm py-2 px-3">
            <i className="bi bi-card-checklist me-1"></i> Manage Subscriptions
          </Link>
          <Link to="/admin/payments" className="btn btn-gym-outline btn-sm py-2 px-3">
            <i className="bi bi-wallet2 me-1"></i> Verify Payments
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={() => loadData(true)} />

      {actionSuccess && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{actionSuccess}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {/* Row 1 Stats */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Registered Members"
            value={stats?.totalMembers || 0}
            icon="bi-people"
            color="#0284c7"
            subtitle="Registered member accounts"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Active Memberships"
            value={stats?.activeMembers || 0}
            icon="bi-check-circle"
            color="#059669"
            subtitle="Currently valid access passes"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Pending Requests"
            value={stats?.pendingMemberships || 0}
            icon="bi-hourglass-split"
            color="#d97706"
            subtitle="Subscriptions awaiting action"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Expired Memberships"
            value={stats?.expiredMemberships || 0}
            icon="bi-exclamation-octagon"
            color="#dc2626"
            subtitle="Due for renewal"
          />
        </div>
      </div>

      {/* Row 2 Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Today's Attendance"
            value={stats?.todayAttendance || 0}
            icon="bi-calendar-check"
            color="#0284c7"
            subtitle="Verified daily check-ins"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Active Trainers"
            value={stats?.totalActiveTrainers || 0}
            icon="bi-person-badge"
            color="#7c3aed"
            subtitle="Certified coaches"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Verified Revenue"
            value={formatCurrency(stats?.totalVerifiedRevenue)}
            icon="bi-cash-stack"
            color="#059669"
            subtitle="Lifetime verified payments"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="This Month's Revenue"
            value={formatCurrency(stats?.monthlyVerifiedRevenue)}
            icon="bi-graph-up"
            color="#0284c7"
            subtitle="Verified in current month"
          />
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Link to="/admin/members" className="btn btn-white bg-white border text-start p-3 w-100 d-flex align-items-center gap-3 shadow-sm rounded-3">
            <div className="rounded-2 p-2 bg-primary-subtle text-primary">
              <i className="bi bi-people fs-5"></i>
            </div>
            <div>
              <div className="fw-semibold text-dark small">Members Roster</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>All accounts</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/admin/trainers" className="btn btn-white bg-white border text-start p-3 w-100 d-flex align-items-center gap-3 shadow-sm rounded-3">
            <div className="rounded-2 p-2 bg-info-subtle text-info">
              <i className="bi bi-person-gear fs-5"></i>
            </div>
            <div>
              <div className="fw-semibold text-dark small">Trainers Staff</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Coaching team</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/admin/membership-plans" className="btn btn-white bg-white border text-start p-3 w-100 d-flex align-items-center gap-3 shadow-sm rounded-3">
            <div className="rounded-2 p-2 bg-success-subtle text-success">
              <i className="bi bi-tags fs-5"></i>
            </div>
            <div>
              <div className="fw-semibold text-dark small">Plans & Tiers</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Pricing packages</div>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/admin/assignments" className="btn btn-white bg-white border text-start p-3 w-100 d-flex align-items-center gap-3 shadow-sm rounded-3">
            <div className="rounded-2 p-2 bg-warning-subtle text-warning">
              <i className="bi bi-diagram-3 fs-5"></i>
            </div>
            <div>
              <div className="fw-semibold text-dark small">Trainer Allocation</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Assign coaches</div>
            </div>
          </Link>
        </div>
      </div>

      {/* DEDICATED REGISTERED USERS & MEMBERS SECTION */}
      <div className="gym-card mb-4">
        <div className="gym-card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fs-6 fw-bold text-dark mb-0">
              <i className="bi bi-people me-2 text-primary"></i> Registered Users & Accounts ({filteredUsers.length})
            </h5>
            <span className="badge bg-light border text-secondary small">
              Live Database
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <select
              className="form-select form-select-sm gym-input"
              style={{ width: '130px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="MEMBER">Members</option>
              <option value="TRAINER">Trainers</option>
              <option value="ADMIN">Admins</option>
            </select>

            {/* User Search Input */}
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control gym-input"
                placeholder="Search name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Link to="/admin/members" className="btn btn-sm btn-gym-outline">
              Full Roster <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>

        <div className="gym-card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-person-x fs-1 mb-2 d-block text-muted"></i>
              <p className="mb-0 text-dark fw-medium">No users found matching current filters.</p>
              <small className="text-secondary">Newly registered members and staff will appear here immediately.</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Registration Date</th>
                    <th>Account Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="text-secondary small fw-bold">#{u.id}</td>
                      <td>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-light border text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                          >
                            {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span>{u.fullName}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{u.email}</td>
                      <td className="text-secondary">{u.phone || '—'}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td className="small text-secondary">{formatDate(u.createdAt)}</td>
                      <td>
                        <span className={`badge-status ${u.active ? 'badge-active' : 'badge-expired'}`}>
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {u.role === 'MEMBER' && (
                            <button
                              className="btn btn-sm btn-gym-outline py-1 px-2"
                              onClick={() => handleViewHistory(u)}
                              title="View Subscription History"
                            >
                              <i className="bi bi-clock-history text-info"></i>
                            </button>
                          )}
                          <button
                            className={`btn btn-sm py-1 px-2 ${u.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleUserStatus(u.id, u.active)}
                            disabled={actionLoading}
                            title={u.active ? 'Suspend account' : 'Activate account'}
                          >
                            {u.active ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="row g-4">
        {/* Recent Payments Table */}
        <div className="col-12 col-lg-6">
          <div className="gym-card h-100">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-dark mb-0">
                <i className="bi bi-receipt me-2 text-primary"></i> Recent Payments
              </h5>
              <Link to="/admin/payments" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>
            <div className="gym-card-body p-0">
              {!stats?.recentPayments || stats.recentPayments.length === 0 ? (
                <p className="text-secondary text-center py-4 mb-0">No payment records logged.</p>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="fw-semibold text-dark small">{p.memberName}</div>
                            <small className="text-secondary">{p.planName}</small>
                          </td>
                          <td className="fw-bold text-success small">{formatCurrency(p.amount)}</td>
                          <td>
                            <code className="text-dark bg-light px-1 rounded small">{p.transactionReference}</code>
                          </td>
                          <td>
                            <span className={`badge-status ${getStatusBadgeClass(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            {p.status === 'PENDING' && (
                              <button
                                className="btn btn-sm btn-gym-primary py-0 px-2 small"
                                onClick={() => handleVerifyPayment(p.id)}
                                disabled={actionLoading}
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Subscriptions Table */}
        <div className="col-12 col-lg-6">
          <div className="gym-card h-100">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-dark mb-0">
                <i className="bi bi-card-checklist me-2 text-primary"></i> Recent Subscriptions
              </h5>
              <Link to="/admin/memberships" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>
            <div className="gym-card-body p-0">
              {!stats?.recentMemberships || stats.recentMemberships.length === 0 ? (
                <p className="text-secondary text-center py-4 mb-0">No recent subscription passes.</p>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Validity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentMemberships.slice(0, 5).map((m) => (
                        <tr key={m.id}>
                          <td>
                            <div className="fw-semibold text-dark small">{m.memberName}</div>
                            <small className="text-secondary">{m.memberEmail}</small>
                          </td>
                          <td className="text-secondary small">{m.planName}</td>
                          <td>
                            <span className={`badge-status ${getStatusBadgeClass(m.status)}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="small text-secondary">
                            {m.startDate ? formatDate(m.startDate) : 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member History Modal */}
      {historyModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content gym-card">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fs-5 text-dark">
                  Subscription History: <span className="text-primary">{historyModal.member?.fullName}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setHistoryModal({ show: false, member: null, history: [] })}
                ></button>
              </div>

              <div className="modal-body p-0">
                {historyLoading ? (
                  <LoadingSpinner message="Loading subscription records..." />
                ) : historyModal.history.length === 0 ? (
                  <p className="text-secondary text-center py-4 mb-0">No past memberships on record for this member.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="gym-table mb-0">
                      <thead>
                        <tr>
                          <th>Plan Name</th>
                          <th>Price</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyModal.history.map((h) => (
                          <tr key={h.id}>
                            <td className="fw-semibold text-dark">{h.planName}</td>
                            <td className="text-success">{formatCurrency(h.planPrice)}</td>
                            <td>{formatDate(h.startDate)}</td>
                            <td>{formatDate(h.endDate)}</td>
                            <td>
                              <span className={`badge-status ${getStatusBadgeClass(h.status)}`}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-gym-outline"
                  onClick={() => setHistoryModal({ show: false, member: null, history: [] })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
