import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trainerApi } from '../../api/trainerApi';
import { workoutApi } from '../../api/workoutApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const WorkoutPlanForm = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const preselectedMemberId = location.state?.preselectedMemberId || '';

  const [formData, setFormData] = useState({
    memberId: preselectedMemberId,
    planName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    exercises: [
      {
        exerciseName: '',
        targetMuscleGroup: 'Chest',
        sets: 3,
        repetitions: 10,
        restSeconds: 60,
        instructions: '',
        targetWeight: '',
        exerciseOrder: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setError('');
        const data = await trainerApi.getMyAssignedMembers();
        setMembers(data);
        if (data.length > 0 && !formData.memberId) {
          setFormData((prev) => ({ ...prev, memberId: data[0].id }));
        }
      } catch (err) {
        setError('Failed to load assigned members list.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      updated[index][field] = value;
      return { ...prev, exercises: updated };
    });
  };

  const addExerciseRow = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseName: '',
          targetMuscleGroup: 'Back',
          sets: 3,
          repetitions: 10,
          restSeconds: 60,
          instructions: '',
          targetWeight: '',
          exerciseOrder: prev.exercises.length + 1,
        },
      ],
    }));
  };

  const removeExerciseRow = (index) => {
    if (formData.exercises.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.memberId) {
      setError('Please select an assigned member.');
      return;
    }
    if (!formData.planName.trim()) {
      setError('Plan name cannot be blank.');
      return;
    }

    // Validate exercises
    for (let i = 0; i < formData.exercises.length; i++) {
      const ex = formData.exercises[i];
      if (!ex.exerciseName.trim()) {
        setError(`Exercise #${i + 1} must have a name.`);
        return;
      }
      if (ex.sets <= 0 || ex.repetitions <= 0 || ex.restSeconds <= 0) {
        setError(`Exercise #${i + 1} must have positive values for sets, repetitions, and rest.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        memberId: parseInt(formData.memberId, 10),
        planName: formData.planName.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        exercises: formData.exercises.map((ex, idx) => ({
          exerciseName: ex.exerciseName.trim(),
          targetMuscleGroup: ex.targetMuscleGroup,
          sets: parseInt(ex.sets, 10),
          repetitions: parseInt(ex.repetitions, 10),
          restSeconds: parseInt(ex.restSeconds, 10),
          instructions: ex.instructions.trim(),
          targetWeight: ex.targetWeight ? parseFloat(ex.targetWeight) : null,
          exerciseOrder: idx + 1,
        })),
      };

      await workoutApi.createWorkoutPlan(payload);
      navigate('/trainer/workout-plans');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workout plan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading client assignment data..." />;
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Author New Workout Routine</h1>
        <p className="dashboard-subtitle">
          Construct a personalized training split with validated exercise sets and repetitions.
        </p>
      </div>

      <ErrorMessage message={error} />

      {members.length === 0 ? (
        <div className="gym-card p-4 text-center text-secondary">
          <i className="bi bi-exclamation-triangle fs-1 text-warning mb-2 d-block"></i>
          <h5>No Members Assigned</h5>
          <p className="small mb-0">
            You must be assigned to at least one gym member before creating personalized workout plans.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Plan Meta Information */}
          <div className="gym-card p-4 mb-4">
            <h5 className="fs-6 fw-bold text-white mb-3">1. Plan Metadata</h5>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-semibold">Target Member *</label>
                <select
                  className="form-select gym-select"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
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

              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-semibold">Plan Name *</label>
                <input
                  type="text"
                  className="form-control gym-input"
                  placeholder="e.g. 12-Week Hypertrophy Split"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small text-secondary fw-semibold">Plan Overview / Goal</label>
                <textarea
                  className="form-control gym-input"
                  rows="2"
                  placeholder="e.g. Progressive overload focus on bench and squat with auxiliary hypertrophy"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small text-secondary fw-semibold">Start Date *</label>
                <input
                  type="date"
                  className="form-control gym-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small text-secondary fw-semibold">End Date (Optional)</label>
                <input
                  type="date"
                  className="form-control gym-input"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Exercises Section */}
          <div className="gym-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fs-6 fw-bold text-white mb-0">2. Exercises & Prescription</h5>
              <button
                type="button"
                className="btn btn-sm btn-gym-teal"
                onClick={addExerciseRow}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Exercise
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {formData.exercises.map((ex, index) => (
                <div key={index} className="p-3 rounded-3" style={{ background: '#12161f', border: '1px solid #262c36' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary">Exercise #{index + 1}</span>
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => removeExerciseRow(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-md-5">
                      <label className="form-label small text-secondary mb-1">Exercise Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm gym-input"
                        placeholder="e.g. Barbell Bench Press"
                        value={ex.exerciseName}
                        onChange={(e) => handleExerciseChange(index, 'exerciseName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label small text-secondary mb-1">Muscle Group *</label>
                      <select
                        className="form-select form-select-sm gym-select"
                        value={ex.targetMuscleGroup}
                        onChange={(e) => handleExerciseChange(index, 'targetMuscleGroup', e.target.value)}
                        required
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Legs - Quads">Legs - Quads</option>
                        <option value="Legs - Hamstrings">Legs - Hamstrings</option>
                        <option value="Arms - Biceps">Arms - Biceps</option>
                        <option value="Arms - Triceps">Arms - Triceps</option>
                        <option value="Core / Abs">Core / Abs</option>
                        <option value="Full Body">Full Body</option>
                        <option value="Cardio / Conditioning">Cardio / Conditioning</option>
                      </select>
                    </div>
                    <div className="col-4 col-md-1">
                      <label className="form-label small text-secondary mb-1">Sets *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm gym-input"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4 col-md-1">
                      <label className="form-label small text-secondary mb-1">Reps *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm gym-input"
                        value={ex.repetitions}
                        onChange={(e) => handleExerciseChange(index, 'repetitions', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4 col-md-2">
                      <label className="form-label small text-secondary mb-1">Rest (sec) *</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        className="form-control form-control-sm gym-input"
                        value={ex.restSeconds}
                        onChange={(e) => handleExerciseChange(index, 'restSeconds', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label small text-secondary mb-1">Execution Cues / Instructions</label>
                      <input
                        type="text"
                        className="form-control form-control-sm gym-input"
                        placeholder="e.g. Pause 1s at bottom, retract scapulae"
                        value={ex.instructions}
                        onChange={(e) => handleExerciseChange(index, 'instructions', e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary mb-1">Target Weight (kg) (Optional)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control form-control-sm gym-input"
                        placeholder="e.g. 60.0"
                        value={ex.targetWeight}
                        onChange={(e) => handleExerciseChange(index, 'targetWeight', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex gap-3 justify-content-end mb-5">
            <button
              type="button"
              className="btn btn-gym-outline"
              onClick={() => navigate('/trainer/workout-plans')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gym-primary px-4"
              disabled={submitting}
            >
              {submitting ? 'Authoring Plan...' : 'Publish Workout Plan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkoutPlanForm;
