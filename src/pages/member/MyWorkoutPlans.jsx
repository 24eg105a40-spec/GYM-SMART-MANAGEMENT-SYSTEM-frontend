import React, { useState, useEffect } from 'react';
import { workoutApi } from '../../api/workoutApi';
import WorkoutPlanCard from '../../components/WorkoutPlanCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const MyWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlans = async () => {
    try {
      setError('');
      const data = await workoutApi.getMyWorkoutPlans();
      setPlans(data);
    } catch (err) {
      setError('Failed to load workout plans from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your customized workout plans..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Personalized Workout Plans</h1>
        <p className="dashboard-subtitle">
          Routines and exercise guidance assigned directly by your certified gym trainer.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={loadPlans} />

      {plans.length === 0 ? (
        <div className="gym-card p-5 text-center text-secondary">
          <i className="bi bi-card-checklist fs-1 d-block mb-3 text-muted"></i>
          <h4 className="fs-5 text-white mb-2">No Workout Plans Found</h4>
          <p className="small mb-0 mx-auto" style={{ maxWidth: '480px' }}>
            Your assigned personal trainer has not yet configured a workout routine for your account. Please consult with your trainer or request a trainer allocation from administration.
          </p>
        </div>
      ) : (
        <div>
          {plans.map((plan) => (
            <WorkoutPlanCard key={plan.id} plan={plan} isTrainer={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorkoutPlans;
