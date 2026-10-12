import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { membershipApi } from '../../api/membershipApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';

const MyMembership = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState({ show: false, membershipId: null });

  const navigate = useNavigate();

  const loadMemberships = async () => {
    try {
      setError('');
      const data = await membershipApi.getMyMemberships();
      setMemberships(data);
    } catch (err) {
      setError('Failed to load membership records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, []);

  const handleRenew = async (id) => {
    setActionLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const renewed = await membershipApi.renewMembership(id);
      setActionSuccess('Renewal request registered successfully! Please submit your payment reference.');
      await loadMemberships();
      navigate('/member/payments', { state: { newMembershipId: renewed.id, planPrice: renewed.planPrice } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew membership.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.membershipId) return;

    setActionLoading(true);
    setError('');

    try {
      await membershipApi.cancelMembership(cancelModal.membershipId);
      setActionSuccess('Pending membership request was cancelled.');
      setCancelModal({ show: false, membershipId: null });
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel membership.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your membership history..." />;
  }

  const activeMembership = memberships.find((m) => m.status === 'ACTIVE');
  const pendingMembership = memberships.find((m) => m.status === 'PENDING');

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">My Membership Status</h1>
          <p className="dashboard-subtitle">
            Manage your subscription validity, renewal status, and historical subscriptions.
          </p>
        </div>
        <Link to="/member/plans" className="btn btn-gym-primary">
          <i className="bi bi-plus-circle me-1"></i> New Plan Subscription
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={loadMemberships} />

      {actionSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{actionSuccess}</div>
        </div>
      )}

      {/* Active Membership Banner Card */}
      {activeMembership ? (
        <div className="gym-card mb-4 p-4 border-primary">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge-status badge-active mb-2 d-inline-block">
                Currently Active
              </span>
              <h3 className="fs-3 text-white fw-bold mb-1">{activeMembership.planName} Plan</h3>
              <p className="text-secondary small mb-3">
                Valid from <strong className="text-white">{formatDate(activeMembership.startDate)}</strong> to{' '}
                <strong className="text-white">{formatDate(activeMembership.endDate)}</strong>
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <div className="p-2 px-3 rounded-3 bg-dark border border-secondary">
                  <small className="text-secondary d-block">Remaining Validity</small>
                  <strong className="text-primary fs-5">{activeMembership.remainingDays} Days</strong>
                </div>
                <div className="p-2 px-3 rounded-3 bg-dark border border-secondary">
                  <small className="text-secondary d-block">Plan Price</small>
                  <strong className="text-success fs-5">{formatCurrency(activeMembership.planPrice)}</strong>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-gym-primary"
                onClick={() => handleRenew(activeMembership.id)}
                disabled={actionLoading}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Renew Subscription
              </button>
              <Link to="/member/payments" className="btn btn-gym-outline">
                <i className="bi bi-receipt me-1"></i> View Payments
              </Link>
            </div>
          </div>
        </div>
      ) : pendingMembership ? (
        <div className="gym-card mb-4 p-4 border-warning">
          <span className="badge-status badge-pending mb-2 d-inline-block">
            Pending Verification
          </span>
          <h3 className="fs-4 text-white fw-bold mb-1">{pendingMembership.planName} Plan</h3>
          <p className="text-secondary small mb-3">
            Requested on {formatDate(pendingMembership.createdAt)}. Validity will activate from{' '}
            {formatDate(pendingMembership.startDate)} once your payment reference is verified by gym administrators.
          </p>
          <div className="d-flex gap-2">
            <Link
              to="/member/payments"
              state={{ newMembershipId: pendingMembership.id, planPrice: pendingMembership.planPrice }}
              className="btn btn-gym-primary"
            >
              <i className="bi bi-credit-card me-1"></i> Submit Payment Reference
            </Link>
            <button
              className="btn btn-gym-outline text-danger border-danger"
              onClick={() => setCancelModal({ show: true, membershipId: pendingMembership.id })}
              disabled={actionLoading}
            >
              Cancel Request
            </button>
          </div>
        </div>
      ) : (
        <div className="gym-card mb-4 p-5 text-center text-secondary">
          <i className="bi bi-card-checklist fs-1 d-block mb-3 text-muted"></i>
          <h4 className="fs-5 text-white mb-2">No Active Membership</h4>
          <p className="small mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            You do not currently hold an active gym membership. Select a plan to begin attending sessions and workouts.
          </p>
          <Link to="/member/plans" className="btn btn-gym-primary">
            Explore Available Packages
          </Link>
        </div>
      )}

      {/* Membership History Table */}
      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-clock-history me-2 text-primary"></i> Membership Subscription History
          </h5>
        </div>
        <div className="gym-card-body p-0">
          {memberships.length === 0 ? (
            <p className="text-secondary text-center py-4 mb-0">No past subscriptions recorded.</p>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Price</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-bold text-white">{m.planName}</td>
                      <td className="text-success">{formatCurrency(m.planPrice)}</td>
                      <td>{formatDate(m.startDate)}</td>
                      <td>{formatDate(m.endDate)}</td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        {m.status === 'EXPIRED' && (
                          <button
                            className="btn btn-sm btn-gym-outline"
                            onClick={() => handleRenew(m.id)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-arrow-repeat me-1"></i> Renew
                          </button>
                        )}
                        {m.status === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setCancelModal({ show: true, membershipId: m.id })}
                            disabled={actionLoading}
                          >
                            Cancel
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

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        show={cancelModal.show}
        title="Cancel Membership Request"
        message="Are you sure you want to cancel this pending membership request? You will need to select a plan again if cancelled."
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModal({ show: false, membershipId: null })}
        confirmText="Yes, Cancel Request"
      />
    </div>
  );
};

export default MyMembership;
