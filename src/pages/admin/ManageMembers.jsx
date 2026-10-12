import React, { useState, useEffect } from 'react';
import { memberApi } from '../../api/memberApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [historyModal, setHistoryModal] = useState({ show: false, member: null, history: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadMembers = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError('');
      const roleParam = roleFilter !== 'ALL' ? roleFilter : undefined;
      const data = await memberApi.getAllMembers(roleParam);
      setMembers(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registered users from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [roleFilter]);

  const handleToggleStatus = async (memberId, currentActive) => {
    try {
      await memberApi.updateMemberStatus(memberId, !currentActive);
      await loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.fullName}" (ID: #${user.id})? This will permanently remove their records from the database.`)) {
      try {
        await memberApi.deleteUser(user.id);
        await loadMembers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleViewHistory = async (member) => {
    setHistoryModal({ show: true, member, history: [] });
    setHistoryLoading(true);
    try {
      const history = await memberApi.getMemberHistory(member.id);
      setHistoryModal({ show: true, member, history: Array.isArray(history) ? history : (history?.data || []) });
    } catch (err) {
      console.error('Failed to load member history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading registered gym accounts roster..." />;
  }

  const filtered = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Manage Registered Users & Members</h1>
          <p className="dashboard-subtitle">
            Live database view of all registered accounts, user roles, verification status, and membership histories.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            className="btn btn-gym-outline btn-sm py-2 px-3 d-flex align-items-center gap-2"
            onClick={() => loadMembers(true)}
            disabled={refreshing}
            title="Refresh database records"
          >
            <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin-anim' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <select
            className="form-select gym-input py-2"
            style={{ width: 'auto', minWidth: '140px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="MEMBER">Members</option>
            <option value="TRAINER">Trainers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <div className="input-group" style={{ minWidth: '240px', maxWidth: '320px' }}>
            <span className="input-group-text bg-light text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control gym-input py-2"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={() => loadMembers(true)} />

      <div className="gym-card">
        <div className="gym-card-header d-flex justify-content-between align-items-center">
          <h5 className="fs-6 fw-bold text-dark mb-0">
            <i className="bi bi-people me-2 text-primary"></i> Registered Users ({filtered.length})
          </h5>
          <span className="badge bg-secondary-subtle text-secondary small">
            Filter: {roleFilter === 'ALL' ? 'All Roles' : roleFilter}
          </span>
        </div>

        <div className="gym-card-body p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-person-x fs-1 text-secondary opacity-50 mb-3 d-block"></i>
              <p className="text-secondary mb-1">No registered users found matching the selected filter or search query.</p>
              <button className="btn btn-sm btn-gym-outline mt-2" onClick={() => { setSearch(''); setRoleFilter('ALL'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Registration Date</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id}>
                      <td className="text-secondary small fw-bold">#{m.id}</td>
                      <td className="fw-semibold text-dark">{m.fullName}</td>
                      <td className="text-secondary">{m.email}</td>
                      <td className="text-secondary">{m.phone || 'N/A'}</td>
                      <td>
                        {m.role === 'ADMIN' ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">ADMIN</span>
                        ) : m.role === 'TRAINER' ? (
                          <span className="badge bg-info-subtle text-info border border-info-subtle">TRAINER</span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle">MEMBER</span>
                        )}
                      </td>
                      <td className="small text-secondary">{formatDate(m.createdAt)}</td>
                      <td>
                        <span className={`badge-status ${m.active ? 'badge-active' : 'badge-expired'}`}>
                          {m.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {m.role === 'MEMBER' && (
                            <button
                              className="btn btn-sm btn-gym-outline py-1 px-2"
                              onClick={() => handleViewHistory(m)}
                              title="View Subscription History"
                            >
                              <i className="bi bi-clock-history me-1 text-info"></i> History
                            </button>
                          )}
                          <button
                            className={`btn btn-sm py-1 px-2 ${m.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(m.id, m.active)}
                            title={m.active ? 'Deactivate account' : 'Activate account'}
                          >
                            {m.active ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            onClick={() => handleDeleteUser(m)}
                            title="Delete user permanently"
                          >
                            <i className="bi bi-trash"></i>
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
                  <LoadingSpinner message="Loading historical subscription records..." />
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

export default ManageMembers;
