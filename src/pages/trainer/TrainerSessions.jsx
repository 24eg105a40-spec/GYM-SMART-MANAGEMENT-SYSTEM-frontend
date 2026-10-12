import React, { useState, useEffect } from 'react';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getStatusBadgeClass } from '../../utils/formatters';

const TrainerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadSessions = async () => {
    try {
      setError('');
      const data = await trainingSessionApi.getTrainerSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load training sessions list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleUpdateStatus = async (sessionId, status, promptReason = false) => {
    let reason = null;
    if (promptReason) {
      reason = window.prompt('Please enter a cancellation reason:');
      if (reason === null) return; // user cancelled prompt
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await trainingSessionApi.updateSessionStatus(sessionId, status, reason);
      setSuccess(`Session marked as ${status}.`);
      await loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update session to ${status}.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading training sessions roster..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Training Sessions Management</h1>
        <p className="dashboard-subtitle">
          Confirm member booking requests, mark finished sessions, and handle cancellations.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadSessions} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-calendar-check me-2 text-primary"></i> All Client Bookings ({sessions.length})
          </h5>
        </div>

        <div className="gym-card-body p-0">
          {sessions.length === 0 ? (
            <p className="text-secondary text-center py-5 mb-0">No training sessions booked with you yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Member</th>
                    <th>Contact</th>
                    <th>Focus / Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="fw-bold text-white">{formatDate(s.sessionDate)}</div>
                        <small className="text-info">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </small>
                      </td>
                      <td className="fw-semibold text-white">{s.memberName}</td>
                      <td>
                        <div className="small text-secondary">{s.memberPhone}</div>
                        <div className="small text-muted">{s.memberEmail}</div>
                      </td>
                      <td>
                        <span className="small text-secondary">{s.purpose || 'General Training'}</span>
                        {s.cancellationReason && (
                          <small className="d-block text-danger">Reason: {s.cancellationReason}</small>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {s.status === 'PENDING' && (
                            <>
                              <button
                                className="btn btn-sm btn-success py-1 px-2"
                                onClick={() => handleUpdateStatus(s.id, 'CONFIRMED')}
                                disabled={actionLoading}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-sm btn-danger py-1 px-2"
                                onClick={() => handleUpdateStatus(s.id, 'REJECTED', true)}
                                disabled={actionLoading}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {s.status === 'CONFIRMED' && (
                            <>
                              <button
                                className="btn btn-sm btn-info py-1 px-2"
                                onClick={() => handleUpdateStatus(s.id, 'COMPLETED')}
                                disabled={actionLoading}
                              >
                                Complete
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                onClick={() => handleUpdateStatus(s.id, 'CANCELLED', true)}
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                            </>
                          )}
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
    </div>
  );
};

export default TrainerSessions;
