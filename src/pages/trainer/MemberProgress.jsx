import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { progressApi } from '../../api/progressApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/dateUtils';

const MemberProgress = () => {
  const { memberId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setError('');
        const data = await progressApi.getMemberProgressForTrainer(memberId);
        setRecords(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch member progress records.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [memberId]);

  if (loading) {
    return <LoadingSpinner message="Retrieving client body measurement history..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="dashboard-title">Client Fitness Progress</h1>
          <p className="dashboard-subtitle">
            Historical measurements recorded by your assigned client.
          </p>
        </div>
        <Link to="/trainer/members" className="btn btn-gym-outline">
          <i className="bi bi-arrow-left me-1"></i> Back to Roster
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="gym-card">
        <div className="gym-card-header">
          <h5 className="fs-6 fw-bold text-white mb-0">
            <i className="bi bi-speedometer2 me-2 text-primary"></i> Body Metrics History ({records.length})
          </h5>
        </div>

        <div className="gym-card-body p-0">
          {records.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-journal-x fs-1 d-block mb-2 text-muted"></i>
              No body progress records entered by this member yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gym-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Body Fat %</th>
                    <th>Waist</th>
                    <th>Notes / Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-medium text-white">{formatDate(r.measurementDate)}</td>
                      <td className="fw-bold text-primary">{r.weightKg} kg</td>
                      <td>{r.bodyFatPercentage ? `${r.bodyFatPercentage}%` : '—'}</td>
                      <td>{r.waistCm ? `${r.waistCm} cm` : '—'}</td>
                      <td className="small text-secondary">{r.notes || '—'}</td>
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

export default MemberProgress;
