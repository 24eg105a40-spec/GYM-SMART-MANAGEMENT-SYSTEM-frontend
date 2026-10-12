import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getStatusBadgeClass } from '../../utils/formatters';

const MyTrainingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModal, setCancelModal] = useState({ show: false, sessionId: null });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadSessions = async () => {
    try {
      setError('');
      const data = await trainingSessionApi.getMySessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load training sessions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCancelSession = async () => {
    if (!cancelModal.sessionId) return;
    setCancelLoading(true);
    setError('');

    try {
      await trainingSessionApi.cancelSession(cancelModal.sessionId, 'Cancelled by member');
      setSuccess('Session has been cancelled.');
      setCancelModal({ show: false, sessionId: null });
      await loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel session.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your training session appointments..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">My Training Sessions</h1>
          <p className="dashboard-subtitle">
            Review upcoming and historical one-on-one sessions with your personal trainers.
          </p>
        </div>
        <Link to="/member/book-session" className="btn btn-gym-primary">
          <i className="bi bi-calendar-plus me-1"></i> Book New Session
        </Link>
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
            <i className="bi bi-calendar2-range me-2 text-primary"></i> Scheduled Sessions Log
          </h5>
        </div>

        <div className="gym-card-body p-0">
          {sessions.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-calendar-x fs-1 d-block mb-3 text-muted"></i>
              <p className="mb-2">No training sessions booked yet.</p>
              <Link to="/member/book-session" className="btn btn-sm btn-gym-primary mt-2">
                Book a Session Now
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Trainer</th>
                    <th>Purpose / Focus</th>
                    <th>Status</th>
                    <th>Action</th>
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
                      <td>
                        <div className="text-white fw-semibold">{s.trainerName}</div>
                        <small className="text-secondary">{s.specialization}</small>
                      </td>
                      <td>
                        <span className="small text-secondary">{s.purpose || 'General Consultation'}</span>
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
                        {(s.status === 'PENDING' || s.status === 'CONFIRMED') && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setCancelModal({ show: true, sessionId: s.id })}
                            disabled={cancelLoading}
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
          )}
        </div>
      </div>

      <ConfirmDialog
        show={cancelModal.show}
        title="Cancel Training Session"
        message="Are you sure you want to cancel this booked training session? This slot will be returned to the open schedule."
        onConfirm={handleCancelSession}
        onCancel={() => setCancelModal({ show: false, sessionId: null })}
        confirmText="Yes, Cancel Session"
      />
    </div>
  );
};

export default MyTrainingSessions;
