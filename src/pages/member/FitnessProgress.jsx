import React, { useState, useEffect } from 'react';
import { progressApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/dateUtils';

const FitnessProgress = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    measurementDate: new Date().toISOString().split('T')[0],
    weightKg: '',
    bodyFatPercentage: '',
    waistCm: '',
    notes: '',
  });

  const loadProgress = async () => {
    try {
      setError('');
      const data = await progressApi.getMyProgress();
      setRecords(data);
    } catch (err) {
      setError('Failed to load fitness progress records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.weightKg || parseFloat(form.weightKg) <= 0) {
      setError('Please provide a valid weight in kg.');
      return;
    }

    setSubmitting(true);
    try {
      await progressApi.recordProgress({
        measurementDate: form.measurementDate,
        weightKg: parseFloat(form.weightKg),
        bodyFatPercentage: form.bodyFatPercentage ? parseFloat(form.bodyFatPercentage) : null,
        waistCm: form.waistCm ? parseFloat(form.waistCm) : null,
        notes: form.notes,
      });

      setSuccessMessage('Measurement recorded successfully!');
      setForm({
        measurementDate: new Date().toISOString().split('T')[0],
        weightKg: '',
        bodyFatPercentage: '',
        waistCm: '',
        notes: '',
      });
      await loadProgress();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record measurement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this progress measurement entry?')) return;
    try {
      await progressApi.deleteProgress(id);
      await loadProgress();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading fitness progress metrics..." />;
  }

  // Calculate simple SVG line chart points for weight if at least 2 records exist
  const sortedRecords = [...records].sort((a, b) => new Date(a.measurementDate) - new Date(b.measurementDate));
  const weights = sortedRecords.map((r) => parseFloat(r.weightKg));
  const minWeight = weights.length > 0 ? Math.min(...weights) - 2 : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) + 2 : 100;
  const range = maxWeight - minWeight || 1;

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Fitness Progress & Biometrics</h1>
        <p className="dashboard-subtitle">
          Record your weight and body measurements to track physical transformations over time.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadProgress} />

      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{successMessage}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Progress Logging Form */}
        <div className="col-12 col-lg-5">
          <div className="gym-card p-4">
            <h5 className="fs-6 fw-bold text-white mb-3">
              <i className="bi bi-plus-circle me-2 text-primary"></i> Log New Measurements
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Measurement Date</label>
                <input
                  type="date"
                  name="measurementDate"
                  className="form-control gym-input"
                  value={form.measurementDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="weightKg"
                  className="form-control gym-input"
                  placeholder="e.g. 74.5"
                  value={form.weightKg}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Body Fat % (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="bodyFatPercentage"
                    className="form-control gym-input"
                    placeholder="e.g. 18.5"
                    value={form.bodyFatPercentage}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Waist (cm) (Optional)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="waistCm"
                    className="form-control gym-input"
                    placeholder="e.g. 82.0"
                    value={form.waistCm}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary fw-semibold">Notes / Observations</label>
                <textarea
                  name="notes"
                  className="form-control gym-input"
                  rows="2"
                  placeholder="Energy levels, nutrition notes, etc."
                  value={form.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-gym-primary w-100" disabled={submitting}>
                {submitting ? 'Recording...' : 'Save Measurement Record'}
              </button>
            </form>
          </div>
        </div>

        {/* Trend Visualization & Table */}
        <div className="col-12 col-lg-7">
          {/* Trend Chart (Clean pure SVG representation) */}
          <div className="gym-card p-4 mb-4">
            <h5 className="fs-6 fw-bold text-white mb-3">
              <i className="bi bi-graph-up-arrow me-2 text-primary"></i> Weight Trend History (kg)
            </h5>

            {sortedRecords.length < 2 ? (
              <div className="text-center py-4 text-secondary small">
                <i className="bi bi-bar-chart fs-1 d-block mb-2 text-muted"></i>
                Log at least two measurements to visualize your weight progression graph.
              </div>
            ) : (
              <div className="p-3 rounded-3" style={{ background: '#12161f' }}>
                <svg viewBox="0 0 500 160" className="w-100" style={{ height: '160px' }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#262c36" strokeDasharray="3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#262c36" strokeDasharray="3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#262c36" strokeDasharray="3" />

                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke="#00d2b4"
                    strokeWidth="3"
                    points={sortedRecords
                      .map((r, i) => {
                        const x = (i / (sortedRecords.length - 1)) * 460 + 20;
                        const y = 140 - ((parseFloat(r.weightKg) - minWeight) / range) * 110;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Data Points */}
                  {sortedRecords.map((r, i) => {
                    const x = (i / (sortedRecords.length - 1)) * 460 + 20;
                    const y = 140 - ((parseFloat(r.weightKg) - minWeight) / range) * 110;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="#0d6efd" stroke="#ffffff" strokeWidth="2" />
                        <text x={x} y={y - 10} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                          {r.weightKg}k
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Historical Table */}
          <div className="gym-card">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-white mb-0">
                <i className="bi bi-journal-text me-2 text-info"></i> Recorded Measurements Log
              </h5>
            </div>
            <div className="gym-card-body p-0">
              {records.length === 0 ? (
                <p className="text-secondary text-center py-4 mb-0">No measurements recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>Body Fat %</th>
                        <th>Waist</th>
                        <th>Notes</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-medium text-white">{formatDate(item.measurementDate)}</td>
                          <td className="fw-bold text-primary">{item.weightKg} kg</td>
                          <td>{item.bodyFatPercentage ? `${item.bodyFatPercentage}%` : '—'}</td>
                          <td>{item.waistCm ? `${item.waistCm} cm` : '—'}</td>
                          <td className="small text-secondary">{item.notes || '—'}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-2"
                              onClick={() => handleDelete(item.id)}
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

export default FitnessProgress;
