import React, { useState, useEffect } from 'react';
import { trainerApi } from '../../api/trainerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    qualification: '',
    experienceYears: 3,
    bio: '',
    hourlyRate: 1000,
  });

  const loadTrainers = async () => {
    try {
      setError('');
      const data = await trainerApi.getAllTrainers(false);
      setTrainers(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Failed to load gym trainers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await trainerApi.createTrainer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        experienceYears: parseInt(form.experienceYears, 10),
        bio: form.bio.trim(),
        hourlyRate: parseFloat(form.hourlyRate),
      });

      setSuccess('Trainer profile and account created successfully!');
      setShowModal(false);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        specialization: '',
        qualification: '',
        experienceYears: 3,
        bio: '',
        hourlyRate: 1000,
      });
      await loadTrainers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trainer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (trainerId, currentActive) => {
    try {
      await trainerApi.updateTrainerStatus(trainerId, !currentActive);
      await loadTrainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update trainer status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trainers roster..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Trainers Management</h1>
          <p className="dashboard-subtitle">
            Recruit, activate, and manage certified fitness instructors and their credentials.
          </p>
        </div>
        <button className="btn btn-gym-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-1"></i> Add New Trainer
        </button>
      </div>

      <ErrorMessage message={error} onRetry={loadTrainers} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-person-gear me-2 text-primary"></i> Certified Trainers Roster ({trainers.length})
          </h5>
        </div>

        <div className="gym-card-body p-0">
          {trainers.length === 0 ? (
            <p className="text-secondary text-center py-5 mb-0">No trainer profiles found in database.</p>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Trainer Name</th>
                    <th>Email & Contact</th>
                    <th>Specialization</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-bold text-white">
                        <i className="bi bi-person-badge-fill me-2 text-primary"></i>
                        {t.fullName}
                      </td>
                      <td>
                        <div className="text-white small">{t.email}</div>
                        <small className="text-secondary">{t.phone}</small>
                      </td>
                      <td className="text-info small">{t.specialization}</td>
                      <td className="text-secondary small">{t.qualification}</td>
                      <td>{t.experienceYears} Years</td>
                      <td className="text-success fw-bold">{formatCurrency(t.hourlyRate)}</td>
                      <td>
                        <span className={`badge-status ${t.active ? 'badge-active' : 'badge-expired'}`}>
                          {t.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm py-1 px-2 ${t.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(t.id, t.active)}
                        >
                          {t.active ? 'Deactivate' : 'Activate'}
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

      {/* Add Trainer Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content gym-card border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fs-5">Add New Certified Trainer</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                ></button>
              </div>

              <form onSubmit={handleCreateTrainer}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control gym-input"
                        placeholder="e.g. Rachel Adams"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control gym-input"
                        placeholder="e.g. rachel.trainer@gym.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control gym-input"
                        placeholder="e.g. 9876543220"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Account Password *</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control gym-input"
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-control gym-input"
                        placeholder="e.g. Weight Management & HIIT"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Qualification *</label>
                      <input
                        type="text"
                        name="qualification"
                        className="form-control gym-input"
                        placeholder="e.g. ACE-CPT, Precision Nutrition"
                        value={form.qualification}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Experience (Years) *</label>
                      <input
                        type="number"
                        min="0"
                        name="experienceYears"
                        className="form-control gym-input"
                        value={form.experienceYears}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary fw-semibold">Hourly Rate (INR) *</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        name="hourlyRate"
                        className="form-control gym-input"
                        value={form.hourlyRate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary fw-semibold">Bio / Coaching Focus</label>
                      <textarea
                        name="bio"
                        className="form-control gym-input"
                        rows="2"
                        placeholder="Coaching philosophy, client achievements..."
                        value={form.bio}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-gym-outline"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gym-primary" disabled={submitting}>
                    {submitting ? 'Creating Account...' : 'Save Trainer Account'}
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

export default ManageTrainers;
