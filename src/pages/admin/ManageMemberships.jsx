import React, { useState, useEffect } from 'react';
import { membershipApi } from '../../api/membershipApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ManageMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await membershipApi.getAll();
      setMemberships(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load memberships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleActivate = (id, memberName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Activate Membership',
      message: `Activate membership pass for "${memberName}"? This will set start date to today and calculate expiry date based on the plan duration.`,
      confirmVariant: 'success',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await membershipApi.activate(id);
          setSuccessMsg(`Membership #${id} activated successfully!`);
          fetchMemberships();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to activate membership.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setConfirmDialog({
      isOpen: true,
      title: `Set Status to ${newStatus}`,
      message: `Are you sure you want to change membership #${id} status to ${newStatus}?`,
      confirmVariant: newStatus === 'CANCELLED' ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await membershipApi.updateStatus(id, newStatus);
          setSuccessMsg(`Membership #${id} status updated to ${newStatus}.`);
          fetchMemberships();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to update status.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredList = memberships.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Manage Subscriptions</h1>
          <p className="dashboard-subtitle">
            Review membership requests, activate passes, and manage subscription lifecycles.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary small fw-semibold">Status:</label>
          <select
            className="form-select gym-input"
            style={{ width: '160px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All ({memberships.length})</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{successMsg}</div>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading subscriptions roster..." />
      ) : filteredList.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-card-checklist fs-1 mb-3 text-secondary"></i>
          <h5 className="text-white">No memberships found</h5>
          <p className="mb-0">No member subscription records match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="gym-card">
          <div className="gym-card-header">
            <h5 className="fs-6 fw-bold text-white mb-0">
              <i className="bi bi-credit-card-2-front me-2 text-primary"></i> Subscriptions ({filteredList.length})
            </h5>
          </div>

          <div className="gym-card-body p-0">
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Plan Name</th>
                    <th>Duration & Price</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((m) => (
                    <tr key={m.id}>
                      <td className="text-secondary small">#{m.id}</td>
                      <td>
                        <div className="fw-bold text-white">{m.memberName}</div>
                        <small className="text-secondary">{m.memberEmail}</small>
                      </td>
                      <td>
                        <div className="fw-semibold text-white">{m.planName}</div>
                        <span className="badge bg-dark border border-secondary text-secondary small">
                          {m.planDurationDays} days
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold" style={{ color: 'var(--lime)' }}>
                          {formatCurrency(m.planPrice)}
                        </div>
                      </td>
                      <td>
                        {m.startDate ? (
                          <div>
                            <small className="text-secondary d-block">
                              {formatDate(m.startDate)} - {formatDate(m.endDate)}
                            </small>
                            {m.daysRemaining !== null && m.daysRemaining !== undefined && (
                              <span
                                className={`badge ${
                                  m.daysRemaining > 7
                                    ? 'bg-success-subtle text-success'
                                    : 'bg-warning-subtle text-warning'
                                } small mt-1`}
                              >
                                {m.daysRemaining > 0 ? `${m.daysRemaining} days left` : 'Expired'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">Not activated</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {m.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-lime py-1 px-3"
                              onClick={() => handleActivate(m.id, m.memberName)}
                              disabled={actionLoading}
                              title="Activate subscription"
                            >
                              <i className="bi bi-check-circle me-1"></i> Activate
                            </button>
                          )}
                          {m.status === 'ACTIVE' && (
                            <button
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              onClick={() => handleUpdateStatus(m.id, 'CANCELLED')}
                              disabled={actionLoading}
                              title="Cancel subscription"
                            >
                              Cancel
                            </button>
                          )}
                          {m.status === 'CANCELLED' && (
                            <button
                              className="btn btn-sm btn-outline-success py-1 px-2"
                              onClick={() => handleUpdateStatus(m.id, 'ACTIVE')}
                              disabled={actionLoading}
                              title="Re-activate subscription"
                            >
                              Re-activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ManageMemberships;
