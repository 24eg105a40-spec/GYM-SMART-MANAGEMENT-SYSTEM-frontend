import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipApi } from '../../api/membershipApi';
import MembershipCard from '../../components/MembershipCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const loadPlans = async () => {
    try {
      setError('');
      const data = await membershipApi.getPlans(true);
      setPlans(data);
    } catch (err) {
      setError('Failed to load membership plans from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStartDate(new Date().toISOString().split('T')[0]);
    setError('');
    setSuccessMessage('');
  };

  const handleConfirmSubscription = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await membershipApi.requestMembership({
        planId: selectedPlan.id,
        startDate: startDate || null,
      });

      setSuccessMessage(`Membership request for "${selectedPlan.name}" submitted successfully! Proceeding to record your payment reference.`);
      setTimeout(() => {
        navigate('/member/payments', { state: { newMembershipId: response.id, planPrice: selectedPlan.price } });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit membership request.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching current membership packages..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Membership Packages</h1>
        <p className="dashboard-subtitle">
          Select a flexible gym membership subscription tailored to your fitness objectives.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadPlans} />

      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{successMessage}</div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="row g-4 mb-5">
        {plans.map((plan) => (
          <div className="col-12 col-md-6 col-lg-3" key={plan.id}>
            <MembershipCard
              plan={plan}
              onSelect={handleSelectPlan}
              disabled={submitting}
            />
          </div>
        ))}
      </div>

      {/* Plan Request Modal / Dialog */}
      {selectedPlan && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content gym-card">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fs-5 text-dark">
                  Confirm Subscription: <span className="text-primary">{selectedPlan.name}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPlan(null)}
                  disabled={submitting}
                ></button>
              </div>

              <form onSubmit={handleConfirmSubscription}>
                <div className="modal-body">
                  <div className="p-3 rounded-3 mb-3 bg-light border">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary small">Duration:</span>
                      <strong className="text-dark">{selectedPlan.durationDays} Days</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary small">Price:</span>
                      <strong className="text-success fs-5">₹{selectedPlan.price}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-secondary small">Personal Training:</span>
                      <strong className={selectedPlan.includesPersonalTraining ? 'text-primary' : 'text-secondary'}>
                        {selectedPlan.includesPersonalTraining ? 'Included' : 'Not Included'}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">
                      Preferred Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control gym-input"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                    <small className="text-muted d-block mt-1">
                      *Note: If you have an active membership, your new plan will seamlessly start after your current plan expires.
                    </small>
                  </div>

                  <div className="alert alert-info small py-2 mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Submitting this request will record your subscription. You can then submit your payment reference for administrator verification.
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-gym-outline"
                    onClick={() => setSelectedPlan(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gym-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Request & Proceed to Payment'}
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

export default MembershipPlans;
