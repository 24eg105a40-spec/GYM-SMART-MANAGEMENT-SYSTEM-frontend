import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutApi } from '../../api/workoutApi';
import WorkoutPlanCard from '../../components/WorkoutPlanCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const ManageWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlans = async () => {
    try {
      setError('');
      const data = await workoutApi.getTrainerWorkoutPlans();
      setPlans(data);
    } catch (err) {
      setError('Failed to load created workout plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleToggleStatus = async (planId, currentActive) => {
    try {
      await workoutApi.updateWorkoutPlanStatus(planId, !currentActive);
      await loadPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update plan status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your workout plans..." />;
  }

  return (
    <div>
      <div className="dashboard-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="dashboard-title">Workout Plan Management</h1>
          <p className="dashboard-subtitle">
            Create, update, and manage workout routines assigned to your clients.
          </p>
        </div>
        <Link to="/trainer/workout-plans/new" className="btn btn-gym-primary">
          <i className="bi bi-plus-circle me-1"></i> Create New Plan
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={loadPlans} />

      {plans.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-activity fs-1 d-block mb-3 text-muted"></i>
          <h4 className="fs-5 text-white mb-2">No Workout Plans Created</h4>
          <p className="small mb-3">You haven't authored any workout plans for your clients yet.</p>
          <Link to="/trainer/workout-plans/new" className="btn btn-gym-primary">
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div>
          {plans.map((plan) => (
            <div key={plan.id} className="position-relative mb-4">
              <WorkoutPlanCard plan={plan} isTrainer={false} />
              <div className="d-flex justify-content-end gap-2 p-2 px-3 rounded-bottom bg-dark border border-top-0 border-secondary">
                <button
                  className={`btn btn-sm ${plan.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                  onClick={() => handleToggleStatus(plan.id, plan.active)}
                >
                  <i className={`bi ${plan.active ? 'bi-pause-circle' : 'bi-play-circle'} me-1`}></i>
                  {plan.active ? 'Deactivate Plan' : 'Activate Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageWorkoutPlans;
