import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getStatusBadgeClass } from '../../utils/formatters';

const TrainerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setError('');
      const data = await dashboardApi.getTrainerDashboard();
      setDashboardData(data?.data || data || null);
    } catch (err) {
      setError('Failed to load trainer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateStatus = async (sessionId, status) => {
    setActionLoading(true);
    try {
      await trainingSessionApi.updateSessionStatus(sessionId, status);
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update session.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trainer dashboard statistics..." />;
  }

  const { assignedMembersCount, pendingSessionsCount, upcomingSessionsCount, todaySessions, upcomingSessions, assignedMembers } = dashboardData || {};

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Trainer Control Center</h1>
          <p className="dashboard-subtitle">
            Manage your client workout allocations, open slot calendar, and training sessions.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/trainer/workout-plans/new" className="btn btn-gym-primary">
            <i className="bi bi-plus-circle me-1"></i> New Workout Plan
          </Link>
          <Link to="/trainer/availability" className="btn btn-gym-outline">
            <i className="bi bi-calendar-plus me-1"></i> Add Availability
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={loadDashboard} />

      {/* Stats Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Assigned Members"
            value={assignedMembersCount || 0}
            icon="bi-people-fill"
            color="#0d6efd"
            subtitle="Clients under your care"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Pending Requests"
            value={pendingSessionsCount || 0}
            icon="bi-clock-history"
            color="#f59e0b"
            subtitle="Require your confirmation"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Today's Sessions"
            value={todaySessions ? todaySessions.length : 0}
            icon="bi-calendar-event"
            color="#00d2b4"
            subtitle="Scheduled for today"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Upcoming Bookings"
            value={upcomingSessionsCount || 0}
            icon="bi-calendar-check"
            color="#10b981"
            subtitle="Upcoming confirmed slots"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Schedule */}
        <div className="col-12 col-lg-7">
          <div className="gym-card mb-4">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-white mb-0">
                <i className="bi bi-stopwatch me-2 text-primary"></i> Today's Training Schedule
              </h5>
            </div>
            <div className="gym-card-body p-0">
              {!todaySessions || todaySessions.length === 0 ? (
                <div className="text-center py-4 text-secondary small">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2 text-muted"></i>
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Member</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySessions.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-bold text-white">
                            {formatTime(s.startTime)} - {formatTime(s.endTime)}
                          </td>
                          <td>
                            <div className="text-white fw-semibold">{s.memberName}</div>
                            <small className="text-secondary">{s.memberPhone}</small>
                          </td>
                          <td>
                            <span className={`badge-status ${getStatusBadgeClass(s.status)}`}>
                              {s.status}
                            </span>
                          </td>
                          <td>
                            {s.status === 'PENDING' && (
                              <button
                                className="btn btn-sm btn-success py-1 px-2 me-1"
                                onClick={() => handleUpdateStatus(s.id, 'CONFIRMED')}
                                disabled={actionLoading}
                              >
                                Accept
                              </button>
                            )}
                            {s.status === 'CONFIRMED' && (
                              <button
                                className="btn btn-sm btn-info py-1 px-2"
                                onClick={() => handleUpdateStatus(s.id, 'COMPLETED')}
                                disabled={actionLoading}
                              >
                                Mark Done
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

          {/* Quick Actions Bar */}
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <Link to="/trainer/members" className="quick-action-btn">
                <i className="bi bi-person-lines-fill quick-action-icon"></i>
                <div>
                  <div className="text-white">View Assigned Clients</div>
                  <small className="text-secondary">Progress & profiles</small>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6">
              <Link to="/trainer/workout-plans" className="quick-action-btn">
                <i className="bi bi-activity quick-action-icon"></i>
                <div>
                  <div className="text-white">Manage Workout Plans</div>
                  <small className="text-secondary">Exercises, sets, repetitions</small>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Assigned Clients Quick Roster */}
        <div className="col-12 col-lg-5">
          <div className="gym-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fs-6 fw-bold text-secondary text-uppercase tracking-wider mb-0">
                <i className="bi bi-people me-2 text-primary"></i> Assigned Members ({assignedMembers?.length || 0})
              </h5>
              <Link to="/trainer/members" className="small text-primary text-decoration-none">
                All Clients
              </Link>
            </div>

            {!assignedMembers || assignedMembers.length === 0 ? (
              <div className="text-center py-4 text-secondary small">
                <i className="bi bi-person-dash fs-2 d-block mb-2 text-muted"></i>
                No members currently allocated to you by administration.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {assignedMembers.map((m) => (
                  <div key={m.id} className="activity-item">
                    <div>
                      <div className="text-white fw-semibold small">{m.fullName}</div>
                      <small className="text-secondary">{m.phone} | {m.email}</small>
                    </div>
                    <div className="d-flex gap-1">
                      <Link
                        to={`/trainer/members/${m.id}/progress`}
                        className="btn btn-sm btn-gym-outline py-1 px-2"
                        title="View Progress"
                      >
                        <i className="bi bi-graph-up text-info"></i>
                      </Link>
                      <Link
                        to="/trainer/workout-plans/new"
                        state={{ preselectedMemberId: m.id }}
                        className="btn btn-sm btn-gym-outline py-1 px-2"
                        title="Assign Workout"
                      >
                        <i className="bi bi-plus-lg text-primary"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
