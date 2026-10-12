import React, { useState, useEffect } from 'react';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/formatters';

const ManageTrainingSessions = () => {
  const [sessions, setSessions] = useState([]);
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

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await trainingSessionApi.getAdminSessions();
      setSessions(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load training sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAdminCancel = (sessionId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Training Session',
      message: `As an administrator, cancel session #${sessionId}? This action will update the booking status to CANCELLED in MySQL.`,
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await trainingSessionApi.cancelSession(sessionId, 'Administrative intervention');
          setSuccessMsg(`Session #${sessionId} was cancelled.`);
          fetchSessions();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to cancel session.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Training Sessions Audit</h1>
          <p className="dashboard-subtitle">
            Overview and administration of all personal coaching sessions across trainers and members.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary small fw-semibold">Status:</label>
          <select
            className="form-select gym-input"
            style={{ width: '170px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All ({sessions.length})</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
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
        <LoadingSpinner message="Loading training sessions roster..." />
      ) : filteredSessions.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-calendar-event fs-1 mb-3 text-secondary"></i>
          <h5 className="text-white">No Training Sessions Found</h5>
          <p className="mb-0">No session bookings match the chosen filter criteria.</p>
        </div>
      ) : (
        <div className="gym-card">
          <div className="gym-card-header">
            <h5 className="fs-6 fw-bold text-white mb-0">
              <i className="bi bi-calendar-range me-2 text-primary"></i> Coaching Sessions ({filteredSessions.length})
            </h5>
          </div>

          <div className="gym-card-body p-0">
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Trainer</th>
                    <th>Date & Time</th>
                    <th>Focus / Goal</th>
                    <th>Status</th>
                    <th>Notes / Reason</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.id}>
                      <td className="text-secondary small">#{s.id}</td>
                      <td>
                        <div className="fw-bold text-white">{s.memberName}</div>
                        <small className="text-secondary">{s.memberEmail}</small>
                      </td>
                      <td>
                        <div className="fw-semibold text-primary">{s.trainerName}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-white">{formatDate(s.sessionDate)}</div>
                        <span className="badge bg-dark border border-secondary text-secondary small">
                          <i className="bi bi-clock me-1 text-primary"></i>
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </span>
                      </td>
                      <td>
                        <span className="small text-secondary">{s.purpose || 'Personal Training'}</span>
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        {s.cancellationReason ? (
                          <small className="text-danger">
                            <i className="bi bi-info-circle me-1"></i>
                            {s.cancellationReason}
                          </small>
                        ) : (
                          <small className="text-muted">--</small>
                        )}
                      </td>
                      <td className="text-end">
                        {(s.status === 'PENDING' || s.status === 'CONFIRMED') && (
                          <button
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            onClick={() => handleAdminCancel(s.id)}
                            disabled={actionLoading}
                            title="Admin cancel session"
                          >
                            Cancel
                          </button>
                        )}
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

export default ManageTrainingSessions;
