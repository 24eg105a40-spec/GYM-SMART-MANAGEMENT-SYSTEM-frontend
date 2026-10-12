import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../api/paymentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatCard from '../../components/StatCard';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentApi.getAll();
      setPayments(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = (id, amount, memberName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Verify Payment',
      message: `Verify transaction #${id} of ${formatCurrency(amount)} from "${memberName}"? This will also automatically activate the associated membership pass in MySQL.`,
      confirmVariant: 'success',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await paymentApi.verify(id);
          setSuccessMsg(`Payment #${id} verified successfully! Linked membership activated.`);
          fetchPayments();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to verify payment.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleStatusChange = (id, newStatus) => {
    setConfirmDialog({
      isOpen: true,
      title: `Update Payment to ${newStatus}`,
      message: `Are you sure you want to change transaction #${id} status to ${newStatus}?`,
      confirmVariant: newStatus === 'FAILED' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await paymentApi.updateStatus(id, newStatus);
          setSuccessMsg(`Payment #${id} marked as ${newStatus}.`);
          fetchPayments();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to update payment status.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredList = payments.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const totalVerified = payments
    .filter((p) => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Payment Verification & Audit</h1>
          <p className="dashboard-subtitle">
            Audit member payment receipts, verify transactions, and monitor gym revenue in INR (₹).
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary small fw-semibold">Status:</label>
          <select
            className="form-select gym-input"
            style={{ width: '160px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All ({payments.length})</option>
            <option value="PENDING">Pending ({pendingCount})</option>
            <option value="VERIFIED">Verified</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Summary Stat Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <StatCard
            title="Total Verified Revenue"
            value={formatCurrency(totalVerified)}
            icon="bi-cash-coin"
            color="#00f59b"
            subtitle="Verified transactions"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <StatCard
            title="Pending Verification"
            value={pendingCount}
            icon="bi-hourglass-split"
            color="#f59e0b"
            subtitle="Awaiting admin action"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <StatCard
            title="Total Logged Records"
            value={payments.length}
            icon="bi-receipt"
            color="#38bdf8"
            subtitle="All transaction logs"
          />
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
        <LoadingSpinner message="Loading financial transactions..." />
      ) : filteredList.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-wallet2 fs-1 mb-3 text-secondary"></i>
          <h5 className="text-white">No payment records found</h5>
          <p className="mb-0">No transaction records match the chosen filter criteria.</p>
        </div>
      ) : (
        <div className="gym-card">
          <div className="gym-card-header">
            <h5 className="fs-6 fw-bold text-white mb-0">
              <i className="bi bi-receipt-cutoff me-2 text-primary"></i> Transaction Records ({filteredList.length})
            </h5>
          </div>

          <div className="gym-card-body p-0">
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Plan / Sub ID</th>
                    <th>Amount</th>
                    <th>Method & Ref</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((p) => (
                    <tr key={p.id}>
                      <td className="text-secondary small">#{p.id}</td>
                      <td>
                        <div className="fw-bold text-white">{p.memberName}</div>
                        <small className="text-secondary">{p.memberEmail}</small>
                      </td>
                      <td>
                        <div className="fw-semibold text-white">{p.planName}</div>
                        <small className="text-secondary">Sub #{p.membershipId}</small>
                      </td>
                      <td>
                        <span className="fw-bold fs-6" style={{ color: 'var(--lime)' }}>
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td>
                        <div className="badge bg-dark border border-secondary text-secondary mb-1">
                          {p.paymentMethod}
                        </div>
                        <div className="font-monospace small text-info">
                          Ref: {p.transactionReference || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <small className="text-secondary">{formatDate(p.paymentDate)}</small>
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.verifiedByName ? (
                          <small className="text-success d-block">
                            <i className="bi bi-check2 me-1"></i>
                            {p.verifiedByName} <br />
                            <span className="text-muted">{formatDate(p.verifiedAt)}</span>
                          </small>
                        ) : (
                          <small className="text-muted">Unverified</small>
                        )}
                      </td>
                      <td className="text-end">
                        {p.status === 'PENDING' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-sm btn-lime py-1 px-2"
                              onClick={() => handleVerify(p.id, p.amount, p.memberName)}
                              disabled={actionLoading}
                              title="Verify and Activate Membership"
                            >
                              <i className="bi bi-check-lg me-1"></i> Verify
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              onClick={() => handleStatusChange(p.id, 'FAILED')}
                              disabled={actionLoading}
                              title="Reject/Fail payment"
                            >
                              Reject
                            </button>
                          </div>
                        ) : p.status === 'VERIFIED' ? (
                          <button
                            className="btn btn-sm btn-outline-warning py-1 px-2"
                            onClick={() => handleStatusChange(p.id, 'REFUNDED')}
                            disabled={actionLoading}
                            title="Mark as refunded"
                          >
                            Refund
                          </button>
                        ) : (
                          <span className="text-muted small">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ManagePayments;
