import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';
import { attendanceApi } from '../../api/attendanceApi';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import WorkoutPlanCard from '../../components/WorkoutPlanCard';
import AttendanceHistory from '../../components/AttendanceHistory';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getStatusBadgeClass } from '../../utils/formatters';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [checkInError, setCheckInError] = useState('');

  const loadDashboard = async () => {
    try {
      setError('');
      const data = await dashboardApi.getMemberDashboard();
      setDashboardData(data?.data || data || null);
    } catch (err) {
      console.error('Error fetching member dashboard:', err);
      setError('Failed to load member dashboard statistics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setCheckInMessage('');
    setCheckInError('');

    try {
      const res = await attendanceApi.checkIn();
      setCheckInMessage(`Checked in successfully at ${formatTime(res.checkInTime)} for ${formatDate(res.attendanceDate)}!`);
      // Reload dashboard stats
      await loadDashboard();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed. Please verify that you have an active membership.';
      setCheckInError(msg);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your personalized dashboard..." />;
  }

  const { activeMembership, attendanceSummary, assignedTrainer, currentWorkoutPlan, latestProgress, upcomingSessions, recentAttendance } = dashboardData || {};

  return (
    <div>
      {/* Welcome Header */}
      <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="dashboard-title">
            Hello, <span className="text-primary">{user?.fullName}</span> 👋
          </h1>
          <p className="dashboard-subtitle">
            Welcome to your member portal. Track attendance, view workout routines, and stay consistent.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/member/plans" className="btn btn-gym-outline">
            <i className="bi bi-tag me-1"></i> Browse Plans
          </Link>
          <Link to="/member/book-session" className="btn btn-gym-primary">
            <i className="bi bi-calendar-plus me-1"></i> Book Session
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={loadDashboard} />

      {/* Check-In Action Alert / Banner */}
      <div className="checkin-banner">
        <div className="d-flex align-items-center">
          <div className={`checkin-status-icon ${attendanceSummary?.checkedInToday ? 'checked' : 'not-checked'}`}>
            <i className={`bi ${attendanceSummary?.checkedInToday ? 'bi-check-circle-fill' : 'bi-exclamation-circle'}`}></i>
          </div>
          <div>
            <h4 className="fs-5 text-white mb-1">
              {attendanceSummary?.checkedInToday ? "You are checked in for today!" : "Today's Gym Check-In"}
            </h4>
            <p className="text-secondary small mb-0">
              {attendanceSummary?.checkedInToday
                ? "Great work staying dedicated to your fitness routine today."
                : "Check in with your active membership to mark today's gym attendance."}
            </p>
            {checkInMessage && <div className="text-success small fw-semibold mt-2">{checkInMessage}</div>}
            {checkInError && <div className="text-danger small fw-semibold mt-2">{checkInError}</div>}
          </div>
        </div>

        {!attendanceSummary?.checkedInToday && (
          <button
            className="btn btn-gym-teal px-4 py-2 mt-3 mt-md-0"
            onClick={handleCheckIn}
            disabled={checkInLoading || !activeMembership || activeMembership.status !== 'ACTIVE'}
            title={!activeMembership ? 'Active membership required' : ''}
          >
            {checkInLoading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Recording...
              </span>
            ) : (
              <span><i className="bi bi-qr-code-scan me-2"></i> Check In Now</span>
            )}
          </button>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Membership Status"
            value={activeMembership ? activeMembership.status : 'NO ACTIVE PLAN'}
            icon="bi-card-checklist"
            color={activeMembership?.status === 'ACTIVE' ? '#10b981' : '#f59e0b'}
            subtitle={activeMembership ? `Plan: ${activeMembership.planName}` : 'Select a plan to start'}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Remaining Validity"
            value={activeMembership ? `${activeMembership.remainingDays} Days` : '0 Days'}
            icon="bi-hourglass-split"
            color="#0d6efd"
            subtitle={activeMembership ? `Expires: ${formatDate(activeMembership.endDate)}` : 'No active expiry'}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Gym Attendance"
            value={`${attendanceSummary?.totalAttendance || 0} Days`}
            icon="bi-check2-circle"
            color="#00d2b4"
            subtitle={`Last 30 Days: ${attendanceSummary?.last30DaysAttendance || 0} visits`}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Latest Weight"
            value={latestProgress ? `${latestProgress.weightKg} kg` : 'Not Recorded'}
            icon="bi-speedometer2"
            color="#a855f7"
            subtitle={latestProgress ? `Date: ${formatDate(latestProgress.measurementDate)}` : 'Log your metrics'}
          />
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column: Assigned Trainer & Current Workout Plan */}
        <div className="col-12 col-lg-7">
          {/* Current Workout Plan */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="dashboard-widget-title text-white mb-0">
              <i className="bi bi-activity text-primary"></i> Current Workout Plan
            </h4>
            <Link to="/member/workout-plans" className="btn btn-sm btn-gym-outline">
              View All Workouts
            </Link>
          </div>

          {currentWorkoutPlan ? (
            <WorkoutPlanCard plan={currentWorkoutPlan} isTrainer={false} />
          ) : (
            <div className="gym-card p-4 text-center text-secondary mb-4">
              <i className="bi bi-card-list fs-1 d-block mb-2 text-muted"></i>
              <p className="mb-2">No active workout plan assigned yet.</p>
              <small>Your assigned trainer will configure your custom training split shortly.</small>
            </div>
          )}

          {/* Recent Attendance */}
          <div className="gym-card">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-white mb-0">
                <i className="bi bi-clock-history me-2 text-info"></i> Recent Attendance Log
              </h5>
              <Link to="/member/attendance" className="btn btn-sm btn-gym-outline">
                Full Log
              </Link>
            </div>
            <div className="gym-card-body p-0">
              <AttendanceHistory records={recentAttendance} showMemberName={false} />
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Trainer & Upcoming Sessions */}
        <div className="col-12 col-lg-5">
          {/* Assigned Trainer Widget */}
          <div className="gym-card mb-4 p-4">
            <h5 className="fs-6 fw-bold text-secondary text-uppercase tracking-wider mb-3">
              <i className="bi bi-person-badge me-2 text-primary"></i> Assigned Trainer
            </h5>
            {assignedTrainer ? (
              <div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="stat-icon" style={{ background: 'rgba(13,110,253,0.15)', color: '#0d6efd' }}>
                    <i className="bi bi-person-fill fs-3"></i>
                  </div>
                  <div>
                    <h5 className="text-white fw-bold mb-0">{assignedTrainer.fullName}</h5>
                    <span className="badge bg-dark border border-secondary text-primary small">
                      {assignedTrainer.specialization}
                    </span>
                  </div>
                </div>
                <p className="text-secondary small mb-3">{assignedTrainer.bio || 'Certified fitness specialist.'}</p>
                <div className="small text-secondary mb-3">
                  <div><i className="bi bi-award me-2 text-info"></i> {assignedTrainer.qualification}</div>
                  <div><i className="bi bi-clock me-2 text-info"></i> {assignedTrainer.experienceYears} Years Exp</div>
                  <div><i className="bi bi-telephone me-2 text-info"></i> {assignedTrainer.phone}</div>
                </div>
                <Link to="/member/book-session" className="btn btn-sm btn-gym-outline w-100">
                  <i className="bi bi-calendar-check me-1"></i> Book One-on-One Session
                </Link>
              </div>
            ) : (
              <div className="text-center text-secondary py-3">
                <i className="bi bi-person-dash fs-2 d-block mb-2"></i>
                <p className="small mb-2">No personal trainer assigned yet.</p>
                <small className="d-block text-muted">Gym administrators assign trainers to members after registration.</small>
              </div>
            )}
          </div>

          {/* Upcoming Training Sessions */}
          <div className="gym-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fs-6 fw-bold text-secondary text-uppercase tracking-wider mb-0">
                <i className="bi bi-calendar-event me-2 text-primary"></i> Upcoming Sessions
              </h5>
              <Link to="/member/my-sessions" className="small text-primary text-decoration-none">
                Manage
              </Link>
            </div>

            {!upcomingSessions || upcomingSessions.length === 0 ? (
              <div className="text-center py-3 text-secondary">
                <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                <p className="small mb-0">No upcoming training sessions booked.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="activity-item">
                    <div>
                      <div className="fw-semibold text-white small">
                        {formatDate(s.sessionDate)} at {formatTime(s.startTime)}
                      </div>
                      <div className="text-secondary small">
                        Trainer: <span className="text-light">{s.trainerName}</span>
                      </div>
                      {s.purpose && <div className="text-muted small fst-italic">{s.purpose}</div>}
                    </div>
                    <div>
                      <span className={`badge-status ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
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

export default MemberDashboard;
