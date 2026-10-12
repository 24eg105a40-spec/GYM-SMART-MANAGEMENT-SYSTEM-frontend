import React, { useState, useEffect } from 'react';
import { trainerAvailabilityApi } from '../../api/trainerAvailabilityApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatTime } from '../../utils/dateUtils';

const ManageAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    availabilityDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });

  const loadSlots = async () => {
    try {
      setError('');
      const data = await trainerAvailabilityApi.getMyAvailability();
      setSlots(data);
    } catch (err) {
      setError('Failed to load availability slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.startTime >= form.endTime) {
      setError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await trainerAvailabilityApi.createAvailability({
        availabilityDate: form.availabilityDate,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
      });

      setSuccess('Availability slot created successfully!');
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create availability slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await trainerAvailabilityApi.deleteAvailability(id);
      await loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete availability slot.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your availability calendar..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Trainer Availability Calendar</h1>
        <p className="dashboard-subtitle">
          Configure open time slots so your assigned members can book one-on-one sessions.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadSlots} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Slot Creation Form */}
        <div className="col-12 col-lg-5">
          <div className="gym-card p-4">
            <h5 className="fs-6 fw-bold text-white mb-3">
              <i className="bi bi-plus-circle me-2 text-primary"></i> Add Open Time Slot
            </h5>

            <form onSubmit={handleCreateSlot}>
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Date *</label>
                <input
                  type="date"
                  name="availabilityDate"
                  className="form-control gym-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.availabilityDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    className="form-control gym-input"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    className="form-control gym-input"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-gym-primary w-100" disabled={submitting}>
                {submitting ? 'Adding Slot...' : 'Publish Open Slot'}
              </button>
            </form>
          </div>
        </div>

        {/* Current Configured Slots Table */}
        <div className="col-12 col-lg-7">
          <div className="gym-card">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-white mb-0">
                <i className="bi bi-calendar3 me-2 text-info"></i> Upcoming Configured Slots ({slots.length})
              </h5>
            </div>
            <div className="gym-card-body p-0">
              {slots.length === 0 ? (
                <p className="text-secondary text-center py-4 mb-0">No upcoming open slots published.</p>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time Window</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-bold text-white">{formatDate(s.availabilityDate)}</td>
                          <td className="text-info">
                            {formatTime(s.startTime)} - {formatTime(s.endTime)}
                          </td>
                          <td>
                            <span className={`badge-status ${s.available ? 'badge-active' : 'badge-pending'}`}>
                              {s.available ? 'Available' : 'Booked'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-2"
                              onClick={() => handleDeleteSlot(s.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
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
      </div>
    </div>
  );
};

export default ManageAvailability;
