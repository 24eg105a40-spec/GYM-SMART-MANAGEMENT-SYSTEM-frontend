import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import AttendanceHistory from '../../components/AttendanceHistory';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatCard from '../../components/StatCard';
import { formatDate, formatTime } from '../../utils/dateUtils';

const MyAttendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [list, sum] = await Promise.all([
        attendanceApi.getMyAttendance(),
        attendanceApi.getMySummary(),
      ]);
      setAttendanceList(list);
      setSummary(sum);
    } catch (err) {
      setError('Failed to fetch attendance data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setSuccessMessage('');
    setError('');

    try {
      const res = await attendanceApi.checkIn();
      setSuccessMessage(`Check-in recorded at ${formatTime(res.checkInTime)} for ${formatDate(res.attendanceDate)}!`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed. Please verify that your membership is active.');
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading attendance records..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Gym Attendance Tracking</h1>
          <p className="dashboard-subtitle">
            Log your daily gym check-ins and review your attendance consistency.
          </p>
        </div>

        {!summary?.checkedInToday ? (
          <button
            className="btn btn-gym-teal px-4"
            onClick={handleCheckIn}
            disabled={checkInLoading}
          >
            {checkInLoading ? 'Recording...' : 'Check In Today'}
          </button>
        ) : (
          <div className="attendance-streak-badge">
            <i className="bi bi-check-circle-fill"></i>
            <span>Checked In Today</span>
          </div>
        )}
      </div>

      <ErrorMessage message={error} onRetry={loadData} />

      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{successMessage}</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <StatCard
            title="Total All-Time Visits"
            value={`${summary?.totalAttendance || 0} Days`}
            icon="bi-calendar-check"
            color="#0d6efd"
            subtitle="Persistent database records"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Last 30 Days Activity"
            value={`${summary?.last30DaysAttendance || 0} Visits`}
            icon="bi-graph-up"
            color="#00d2b4"
            subtitle="Trailing month consistency"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Current Month Visits"
            value={`${summary?.currentMonthAttendance || 0} Visits`}
            icon="bi-calendar3"
            color="#10b981"
            subtitle="Visits this calendar month"
          />
        </div>
      </div>

      {/* Attendance History Card */}
      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-clock-history me-2 text-primary"></i> Attendance History Log
          </h5>
        </div>
        <div className="gym-card-body p-0">
          <AttendanceHistory records={attendanceList} showMemberName={false} />
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
