import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/formatters';

const AttendanceHistory = ({ records = [], showMemberName = false }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-4 text-secondary">
        <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
        No attendance records found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="gym-table">
        <thead>
          <tr>
            <th>Date</th>
            {showMemberName && <th>Member</th>}
            <th>Check-in Time</th>
            <th>Check-out Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id}>
              <td className="fw-medium text-white">{formatDate(item.attendanceDate)}</td>
              {showMemberName && (
                <td>
                  <div className="fw-medium text-white">{item.memberName || 'N/A'}</div>
                  <small className="text-secondary">{item.memberEmail}</small>
                </td>
              )}
              <td>
                <span className="badge bg-dark border border-secondary text-light px-2 py-1">
                  <i className="bi bi-clock me-1 text-primary"></i>
                  {formatTime(item.checkInTime)}
                </span>
              </td>
              <td>
                {item.checkOutTime ? (
                  <span className="badge bg-dark border border-secondary text-light px-2 py-1">
                    <i className="bi bi-clock me-1 text-info"></i>
                    {formatTime(item.checkOutTime)}
                  </span>
                ) : (
                  <span className="text-secondary small">—</span>
                )}
              </td>
              <td>
                <span className={`badge-status ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;
