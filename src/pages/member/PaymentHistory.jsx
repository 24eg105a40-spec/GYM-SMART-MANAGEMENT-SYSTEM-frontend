import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentApi } from '../../api/paymentApi';
import { membershipApi } from '../../api/membershipApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const preselectedMembershipId = location.state?.newMembershipId || '';
  const preselectedPlanPrice = location.state?.planPrice || '';

  const [form, setForm] = useState({
    membershipId: preselectedMembershipId,
    amount: preselectedPlanPrice,
    paymentMethod: 'UPI',
    transactionReference: '',
  });

  const loadData = async () => {
    try {
      setError('');
      const [payList, memList] = await Promise.all([
        paymentApi.getMyPayments(),
        membershipApi.getMyMemberships(),
      ]);
      setPayments(payList);
      setMemberships(memList);

      // If preselected was passed and we haven't set amount yet
      if (preselectedMembershipId && !form.amount) {
        const found = memList.find((m) => m.id === preselectedMembershipId);
        if (found) {
          setForm((prev) => ({ ...prev, amount: found.planPrice }));
        }
      }
    } catch (err) {
      setError('Failed to load payment history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMembershipChange = (e) => {
    const memId = parseInt(e.target.value, 10);
    const chosen = memberships.find((m) => m.id === memId);
    setForm((prev) => ({
      ...prev,
      membershipId: memId || '',
      amount: chosen ? chosen.planPrice : '',
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.membershipId) {
      setError('Please select a membership subscription to pay for.');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please provide a valid payment amount.');
      return;
    }
    if (!form.transactionReference.trim()) {
      setError('Please provide the transaction reference or receipt number.');
      return;
    }

    setSubmitting(true);
    try {
      await paymentApi.recordPayment({
        membershipId: form.membershipId,
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference.trim(),
      });

      setSuccess('Payment reference recorded successfully! Gym administrators will review and verify it shortly.');
      setForm({
        membershipId: '',
        amount: '',
        paymentMethod: 'UPI',
        transactionReference: '',
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading financial payment transactions..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Payment Records & Verification</h1>
        <p className="dashboard-subtitle">
          Record manual transaction receipts and review administrator verification status.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadData} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Record Payment Form */}
        <div className="col-12 col-lg-5">
          <div className="gym-card p-4">
            <h5 className="fs-6 fw-bold text-white mb-3">
              <i className="bi bi-wallet2 me-2 text-primary"></i> Record Transaction Reference
            </h5>

            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Target Subscription *</label>
                <select
                  className="form-select gym-select"
                  value={form.membershipId}
                  onChange={handleMembershipChange}
                  required
                >
                  <option value="">-- Choose Subscription --</option>
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.planName} ({m.status}) - ₹{m.planPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Payment Amount (INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control gym-input"
                  placeholder="e.g. 1500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Payment Method *</label>
                <select
                  className="form-select gym-select"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  required
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CASH">Cash (Front Desk)</option>
                  <option value="CARD">Credit / Debit Card POS</option>
                  <option value="NET_BANKING">Net Banking Transfer</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary fw-semibold">
                  Transaction Reference / UTR Number *
                </label>
                <input
                  type="text"
                  className="form-control gym-input"
                  placeholder="e.g. UPI-TXN-984729103 or Cash Receipt #"
                  value={form.transactionReference}
                  onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
                  required
                />
                <small className="text-muted d-block mt-1">
                  *Academic Project Notice: Online payments are simulated via manual transaction logging verified by the gym admin.
                </small>
              </div>

              <button type="submit" className="btn btn-gym-primary w-100" disabled={submitting}>
                {submitting ? 'Recording Transaction...' : 'Submit Payment Reference'}
              </button>
            </form>
          </div>
        </div>

        {/* Payment History Log */}
        <div className="col-12 col-lg-7">
          <div className="gym-card">
            <div className="gym-card-header">
              <h5 className="fs-6 fw-bold text-white mb-0">
                <i className="bi bi-clock-history me-2 text-info"></i> Recorded Payments
              </h5>
            </div>
            <div className="gym-card-body p-0">
              {payments.length === 0 ? (
                <p className="text-secondary text-center py-4 mb-0">No payment records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="small text-white">{formatDate(p.paymentDate)}</td>
                          <td className="fw-semibold text-white">{p.planName}</td>
                          <td className="fw-bold text-success">{formatCurrency(p.amount)}</td>
                          <td className="small text-secondary">{p.paymentMethod}</td>
                          <td>
                            <code className="text-info small">{p.transactionReference}</code>
                          </td>
                          <td>
                            <span className={`badge-status ${getStatusBadgeClass(p.status)}`}>
                              {p.status}
                            </span>
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

export default PaymentHistory;
