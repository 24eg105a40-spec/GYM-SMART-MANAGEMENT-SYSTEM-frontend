import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatCard from '../../components/StatCard';
import { formatDate, formatTime, getStatusBadgeClass } from '../../utils/formatters';

const ManageAttendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit/Correct Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [correctStatus, setCorrectStatus] = useState('PRESENT');
  const [correctCheckOutTime, setCorrectCheckOutTime] = useState('');
  const [savingCorrection, setSavingCorrection] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const [listRes, summaryRes] = await Promise.all([
        attendanceApi.getAll(params),
        attendanceApi.getAdminSummary(params),
      ]);

      setAttendanceList(Array.isArray(listRes) ? listRes : (listRes?.data || []));
      setSummary(summaryRes?.data || summaryRes || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const handleOpenCorrection = (att) => {
    setEditingItem(att);
    setCorrectStatus(att.status || 'PRESENT');
    setCorrectCheckOutTime(att.checkOutTime ? att.checkOutTime.substring(0, 5) : '');
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingCorrection(true);
      const updateData = {
        status: correctStatus,
        checkOutTime: correctCheckOutTime ? `${correctCheckOutTime}:00` : null,
      };

      await attendanceApi.correct(editingItem.id, updateData);
      setSuccessMsg(`Attendance record #${editingItem.id} updated successfully.`);
      setEditingItem(null);
      fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update attendance record.');
    } finally {
      setSavingCorrection(false);
    }
  };

  const filteredList = attendanceList.filter((item) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      item.memberName?.toLowerCase().includes(q) ||
      item.memberEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Gym Attendance Tracking</h1>
          <p className="dashboard-subtitle">
            Monitor daily member check-ins, verify physical access, and correct logs.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary small fw-semibold">Filter Date:</label>
          <input
            type="date"
            className="form-control gym-input"
            style={{ width: '170px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              className="btn btn-sm btn-gym-outline"
              onClick={() => setDateFilter('')}
              title="Clear date filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard
              title="Total Check-Ins"
              value={summary.totalCheckIns || 0}
              icon="bi-calendar-check"
              color="#00f59b"
              subtitle="Logged attendances"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard
              title="Unique Members"
              value={summary.uniqueMembers || 0}
              icon="bi-person-check"
              color="#38bdf8"
              subtitle="Unique gym visitors"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard
              title="Total in View"
              value={filteredList.length}
              icon="bi-list-check"
              color="#a855f7"
              subtitle="Entries matching criteria"
            />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="gym-card mb-4 p-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control gym-input"
                placeholder="Search member by name or email..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7 text-md-end text-secondary small">
            Displaying {filteredList.length} of {attendanceList.length} attendance entries
          </div>
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
        <LoadingSpinner message="Loading attendance logs..." />
      ) : filteredList.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-calendar-x fs-1 mb-3 text-secondary"></i>
          <h5 className="text-white">No check-in logs found</h5>
          <p className="mb-0">No attendance records match the chosen search or date filter.</p>
        </div>
      ) : (
        <div className="gym-card">
          <div className="gym-card-header">
            <h5 className="fs-6 fw-bold text-white mb-0">
              <i className="bi bi-clipboard-check me-2 text-primary"></i> Attendance Records ({filteredList.length})
            </h5>
          </div>

          <div className="gym-card-body p-0">
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member Name</th>
                    <th>Member Email</th>
                    <th>Date</th>
                    <th>Check-In Time</th>
                    <th>Check-Out Time</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((att) => (
                    <tr key={att.id}>
                      <td className="text-secondary small">#{att.id}</td>
                      <td className="fw-bold text-white">{att.memberName}</td>
                      <td className="text-secondary">{att.memberEmail}</td>
                      <td>{formatDate(att.attendanceDate)}</td>
                      <td>
                        <span className="badge bg-dark border border-secondary text-light">
                          <i className="bi bi-clock me-1 text-primary"></i>
                          {formatTime(att.checkInTime)}
                        </span>
                      </td>
                      <td>
                        {att.checkOutTime ? (
                          <span className="badge bg-dark border border-secondary text-secondary">
                            <i className="bi bi-box-arrow-right me-1 text-secondary"></i>
                            {formatTime(att.checkOutTime)}
                          </span>
                        ) : (
                          <span className="text-muted small">--</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(att.status)}`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-gym-outline py-1 px-2"
                          onClick={() => handleOpenCorrection(att)}
                          title="Edit attendance entry"
                        >
                          <i className="bi bi-pencil-square me-1"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingItem && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content gym-card border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold fs-5">Correct Attendance Record #{editingItem.id}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditingItem(null)}
                  disabled={savingCorrection}
                ></button>
              </div>
              <form onSubmit={handleSaveCorrection}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="text-secondary small">Member</label>
                    <div className="fw-bold text-white">
                      {editingItem.memberName} ({editingItem.memberEmail})
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="text-secondary small">Date</label>
                      <div className="fw-semibold text-white">{formatDate(editingItem.attendanceDate)}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small">Original Check-In</label>
                      <div className="fw-semibold text-white">{formatTime(editingItem.checkInTime)}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Attendance Status</label>
                    <select
                      className="form-select gym-input"
                      value={correctStatus}
                      onChange={(e) => setCorrectStatus(e.target.value)}
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="EXCUSED">EXCUSED</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Check-Out Time (Optional)</label>
                    <input
                      type="time"
                      className="form-control gym-input"
                      value={correctCheckOutTime}
                      onChange={(e) => setCorrectCheckOutTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-gym-outline"
                    onClick={() => setEditingItem(null)}
                    disabled={savingCorrection}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime" disabled={savingCorrection}>
                    {savingCorrection ? 'Saving...' : 'Save Correction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAttendance;
