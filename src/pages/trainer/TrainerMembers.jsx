import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainerApi } from '../../api/trainerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const TrainerMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    try {
      setError('');
      const data = await trainerApi.getMyAssignedMembers();
      setMembers(data);
    } catch (err) {
      setError('Failed to load assigned members list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your assigned client members..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Assigned Client Members</h1>
        <p className="dashboard-subtitle">
          Manage training regimens, review body recomposition progress, and design workout routines.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadMembers} />

      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-people-fill me-2 text-primary"></i> Client Roster ({members.length})
          </h5>
        </div>

        <div className="gym-card-body p-0">
          {members.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-person-slash fs-1 d-block mb-3 text-muted"></i>
              <p className="mb-0">No members currently assigned to you.</p>
              <small className="text-muted">The gym administrator allocates members to your training roster.</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-bold text-white">
                        <i className="bi bi-person-circle me-2 text-info"></i>
                        {m.fullName}
                      </td>
                      <td className="text-secondary">{m.email}</td>
                      <td className="text-secondary">{m.phone}</td>
                      <td>
                        <span className={`badge-status ${m.active ? 'badge-active' : 'badge-expired'}`}>
                          {m.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/trainer/members/${m.id}/progress`}
                            className="btn btn-sm btn-gym-outline"
                          >
                            <i className="bi bi-graph-up me-1 text-info"></i> Progress
                          </Link>
                          <Link
                            to="/trainer/workout-plans/new"
                            state={{ preselectedMemberId: m.id }}
                            className="btn btn-sm btn-gym-primary"
                          >
                            <i className="bi bi-plus-circle me-1"></i> New Plan
                          </Link>
                        </div>
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
  );
};

export default TrainerMembers;
