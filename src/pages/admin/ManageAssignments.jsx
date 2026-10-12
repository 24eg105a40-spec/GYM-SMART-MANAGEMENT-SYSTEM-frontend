import React, { useState, useEffect } from 'react';
import { trainerAssignmentApi } from '../../api/trainerAssignmentApi';
import { memberApi } from '../../api/memberApi';
import { trainerApi } from '../../api/trainerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / Form state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formMemberId, setFormMemberId] = useState('');
  const [formTrainerId, setFormTrainerId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignRes, membersRes, trainersRes] = await Promise.all([
        trainerAssignmentApi.getAll(),
        memberApi.getAllMembers(),
        trainerApi.getAll(),
      ]);
      setAssignments(Array.isArray(assignRes) ? assignRes : (assignRes?.data || []));
      setMembers(Array.isArray(membersRes) ? membersRes : (membersRes?.data || []));
      setTrainers(Array.isArray(trainersRes) ? trainersRes : (trainersRes?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trainer assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!formMemberId || !formTrainerId) {
      setError('Please select both a member and a trainer.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await trainerAssignmentApi.assign({
        memberId: Number(formMemberId),
        trainerId: Number(formTrainerId),
        notes: formNotes,
      });
      setSuccessMsg('Trainer successfully assigned to member!');
      setShowAssignModal(false);
      setFormMemberId('');
      setFormTrainerId('');
      setFormNotes('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trainer assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = (assignment) => {
    const newStatus = !assignment.active;
    const actionText = newStatus ? 'activate' : 'deactivate';

    setConfirmDialog({
      isOpen: true,
      title: `${newStatus ? 'Activate' : 'Deactivate'} Assignment`,
      message: `Are you sure you want to ${actionText} the assignment between member "${assignment.memberName}" and trainer "${assignment.trainerName}"?`,
      confirmVariant: newStatus ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await trainerAssignmentApi.updateStatus(assignment.id, newStatus);
          setSuccessMsg(`Assignment #${assignment.id} ${newStatus ? 'activated' : 'deactivated'}.`);
          fetchData();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to update assignment status.');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Trainer Allocations</h1>
          <p className="dashboard-subtitle">
            Assign certified personal coaches to gym members for tailored workout guidance.
          </p>
        </div>
        <button
          className="btn btn-lime"
          onClick={() => {
            setShowAssignModal(true);
            setError(null);
          }}
        >
          <i className="bi bi-person-plus-fill me-2"></i> Assign Trainer
        </button>
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
        <LoadingSpinner message="Loading trainer assignments..." />
      ) : assignments.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-people fs-1 mb-3 text-secondary"></i>
          <h5 className="text-white">No Trainer Assignments Found</h5>
          <p className="mb-0">Click "Assign Trainer" to allocate a coach to a registered gym member.</p>
        </div>
      ) : (
        <div className="gym-card">
          <div className="gym-card-header">
            <h5 className="fs-6 fw-bold text-white mb-0">
              <i className="bi bi-diagram-3 me-2 text-primary"></i> Active Allocations ({assignments.length})
            </h5>
          </div>

          <div className="gym-card-body p-0">
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Trainer</th>
                    <th>Specialization</th>
                    <th>Assigned Date</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((item) => (
                    <tr key={item.id}>
                      <td className="text-secondary small">#{item.id}</td>
                      <td>
                        <div className="fw-bold text-white">{item.memberName}</div>
                        <small className="text-secondary">{item.memberEmail}</small>
                      </td>
                      <td>
                        <div className="fw-bold text-primary">{item.trainerName}</div>
                        <small className="text-secondary">ID: #{item.trainerId}</small>
                      </td>
                      <td>
                        <span className="badge bg-dark border border-secondary text-secondary">
                          {item.trainerSpecialization || 'General Fitness'}
                        </span>
                      </td>
                      <td>
                        <small className="text-secondary">{formatDate(item.assignedAt)}</small>
                      </td>
                      <td>
                        <small className="text-secondary">{item.notes || 'No specific notes'}</small>
                      </td>
                      <td>
                        <span className={`badge-status ${item.active ? 'badge-active' : 'badge-expired'}`}>
                          {item.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm py-1 px-2 ${item.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={actionLoading}
                        >
                          {item.active ? 'Deactivate' : 'Activate'}
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

      {/* Assign Trainer Modal */}
      {showAssignModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content gym-card border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold fs-5">Allocate Trainer to Member</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Select Member *</label>
                    <select
                      className="form-select gym-input"
                      value={formMemberId}
                      onChange={(e) => setFormMemberId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Select Trainer *</label>
                    <select
                      className="form-select gym-input"
                      value={formTrainerId}
                      onChange={(e) => setFormTrainerId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Trainer --</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} - {t.specialization} ({t.experienceYears} yrs exp)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary fw-semibold">Assignment Notes (Optional)</label>
                    <textarea
                      className="form-control gym-input"
                      rows="3"
                      placeholder="e.g. Focus on strength training, posture correction, and diet adherence"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-gym-outline"
                    onClick={() => setShowAssignModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
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

export default ManageAssignments;
