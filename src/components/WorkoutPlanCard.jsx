import React from 'react';
import { formatDate } from '../utils/dateUtils';

const WorkoutPlanCard = ({ plan, onEdit, isTrainer = false }) => {
  return (
    <div className="gym-card mb-4">
      <div className="gym-card-header">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fs-5 mb-0 text-white">{plan.planName}</h4>
            <span className={`badge-status ${plan.active ? 'badge-active' : 'badge-expired'}`}>
              {plan.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <small className="text-secondary">
            Assigned by: <strong className="text-white">{plan.trainerName || 'Trainer'}</strong> |
            Start: {formatDate(plan.startDate)} {plan.endDate ? `| End: ${formatDate(plan.endDate)}` : ''}
          </small>
        </div>
        {isTrainer && onEdit && (
          <button className="btn btn-sm btn-gym-outline" onClick={() => onEdit(plan)}>
            <i className="bi bi-pencil-square me-1"></i> Edit Plan
          </button>
        )}
      </div>

      <div className="gym-card-body">
        {plan.description && <p className="text-secondary small mb-3">{plan.description}</p>}

        <h5 className="fs-6 fw-semibold text-uppercase tracking-wider text-secondary mb-3">
          Exercises ({plan.exercises ? plan.exercises.length : 0})
        </h5>

        {!plan.exercises || plan.exercises.length === 0 ? (
          <p className="text-secondary small fst-italic">No exercises added to this plan yet.</p>
        ) : (
          <div className="row g-3">
            {plan.exercises.map((ex, idx) => (
              <div className="col-12 col-md-6" key={ex.id || idx}>
                <div className="exercise-card">
                  <div className="exercise-header">
                    <div className="d-flex align-items-center gap-2">
                      <div className="exercise-order-badge">{ex.exerciseOrder || idx + 1}</div>
                      <h6 className="mb-0 text-white fw-bold">{ex.exerciseName}</h6>
                    </div>
                    <span className="badge bg-dark border border-secondary text-info small">
                      {ex.targetMuscleGroup}
                    </span>
                  </div>

                  <div className="exercise-metrics">
                    <div className="metric-chip">
                      Sets: <strong>{ex.sets}</strong>
                    </div>
                    <div className="metric-chip">
                      Reps: <strong>{ex.repetitions}</strong>
                    </div>
                    <div className="metric-chip">
                      Rest: <strong>{ex.restSeconds}s</strong>
                    </div>
                    {ex.targetWeight && (
                      <div className="metric-chip">
                        Weight: <strong>{ex.targetWeight} kg</strong>
                      </div>
                    )}
                  </div>

                  {ex.instructions && (
                    <div className="exercise-instructions">
                      {ex.instructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanCard;
