import React, { useState, useEffect } from 'react';
import { membershipApi } from '../../api/membershipApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';

const ManageMembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    durationDays: 30,
    price: '',
    facilities: '',
    includesPersonalTraining: false,
    active: true,
  });

  const loadPlans = async () => {
    try {
      setError('');
      const data = await membershipApi.getPlans(false);
      setPlans(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Failed to load membership plans from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      description: '',
      durationDays: 30,
      price: '',
      facilities: 'Gym floor access, lockers, showers',
      includesPersonalTraining: false,
      active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      durationDays: plan.durationDays,
      price: plan.price,
      facilities: plan.facilities || '',
      includesPersonalTraining: plan.includesPersonalTraining,
      active: plan.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        durationDays: parseInt(form.durationDays, 10),
        price: parseFloat(form.price),
        facilities: form.facilities.trim(),
        includesPersonalTraining: form.includesPersonalTraining,
        active: form.active,
      };

      if (editingPlan) {
        await membershipApi.updatePlan(editingPlan.id, payload);
        setSuccess(`Plan "${form.name}" updated successfully!`);
      } else {
        await membershipApi.createPlan(payload);
        setSuccess(`New plan "${form.name}" created successfully!`);
      }

      setShowModal(false);
      await loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save membership plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (planId, currentActive) => {
    try {
      await membershipApi.updatePlanStatus(planId, !currentActive);
      await loadPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update plan status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading membership plans..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Membership Plans Configuration</h1>
          <p className="dashboard-subtitle">
            Create, calibrate pricing, and configure access amenities for all subscription packages.
          </p>
        </div>
        <button className="btn btn-gym-primary" onClick={openCreateModal}>
          <i className="bi bi-plus-circle me-1"></i> Create New Plan
        </button>
      </div>

      <ErrorMessage message={error} onRetry={loadPlans} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-tags-fill me-2 text-primary"></i> Membership Packages ({plans.length})
          </h5>
        </div>

        <div className="gym-card-body p-0">
          <div className="table-responsive">
            <table className="gym-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Facilities & Amenities</th>
                  <th>Personal Training</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold text-white">{p.name}</td>
                    <td>{p.durationDays} Days</td>
                    <td className="fw-bold text-success">{formatCurrency(p.price)}</td>
                    <td className="small text-secondary" style={{ maxWidth: '280px' }}>
                      {p.facilities || 'General Gym Facilities'}
                    </td>
                    <td>
                      <span className={`badge ${p.includesPersonalTraining ? 'bg-primary' : 'bg-dark border border-secondary text-secondary'}`}>
                        {p.includesPersonalTraining ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${p.active ? 'badge-active' : 'badge-expired'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-gym-outline py-1 px-2"
                          onClick={() => openEditModal(p)}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Edit
                        </button>
                        <button
                          className={`btn btn-sm py-1 px-2 ${p.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(p.id, p.active)}
                        >
                          {p.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content gym-card border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fs-5">
                  {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Plan Name *</label>
                    <input
                      type="text"
                      className="form-control gym-input"
                      placeholder="e.g. Monthly, Quarterly, Annual"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary fw-semibold">Duration (Days) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control gym-input"
                        placeholder="e.g. 30"
                        value={form.durationDays}
                        onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary fw-semibold">Price (INR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-control gym-input"
                        placeholder="e.g. 1500"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Included Facilities (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control gym-input"
                      placeholder="e.g. Cardio Zone, Free Weights, Steam Bath"
                      value={form.facilities}
                      onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Short Description</label>
                    <textarea
                      className="form-control gym-input"
                      rows="2"
                      placeholder="Package description for members..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ptSwitch"
                        checked={form.includesPersonalTraining}
                        onChange={(e) => setForm({ ...form, includesPersonalTraining: e.target.checked })}
                      />
                      <label className="form-check-label text-white small" htmlFor="ptSwitch">
                        Includes Personal Training
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activeSwitch"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      />
                      <label className="form-check-label text-white small" htmlFor="activeSwitch">
                        Active (Visible to Members)
                      </label>
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
                    {submitting ? 'Saving Plan...' : 'Save Plan Package'}
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

export default ManageMembershipPlans;
