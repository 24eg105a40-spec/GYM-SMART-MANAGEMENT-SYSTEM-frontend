import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../api/trainerApi';
import { trainerAvailabilityApi } from '../../api/trainerAvailabilityApi';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatTime } from '../../utils/dateUtils';

const BookTrainingSession = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setError('');
        const data = await trainerApi.getAllTrainers(true);
        setTrainers(data);
        if (data.length > 0) {
          handleSelectTrainer(data[0]);
        }
      } catch (err) {
        setError('Failed to load active trainers.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const handleSelectTrainer = async (trainer) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(null);
    setSlotsLoading(true);
    try {
      const slots = await trainerAvailabilityApi.getTrainerAvailability(trainer.id);
      setAvailabilities(slots);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setAvailabilities([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!selectedTrainer || !selectedSlot) {
      setError('Please select a trainer and an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await trainingSessionApi.bookSession({
        trainerId: selectedTrainer.id,
        availabilityId: selectedSlot.id,
        sessionDate: selectedSlot.availabilityDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        purpose: purpose || 'Personal Fitness Session',
      });

      setSuccess('Training session booked successfully! Redirecting to your sessions log...');
      setTimeout(() => {
        navigate('/member/my-sessions');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book session. The slot may have been taken or conflicts with your schedule.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading personal trainers and open slots..." />;
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Book a Training Session</h1>
        <p className="dashboard-subtitle">
          Schedule one-on-one sessions with our certified fitness specialists.
        </p>
      </div>

      <ErrorMessage message={error} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Trainer Selection List */}
        <div className="col-12 col-md-5">
          <h5 className="fs-6 fw-bold text-white mb-3">1. Select a Fitness Specialist</h5>
          <div className="d-flex flex-column gap-3 mb-4">
            {trainers.map((t) => {
              const isSelected = selectedTrainer?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`gym-card p-3 cursor-pointer ${isSelected ? 'border-primary' : ''}`}
                  onClick={() => handleSelectTrainer(t)}
                  style={{ cursor: 'pointer', background: isSelected ? '#151f30' : '#161b22' }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="text-white fw-bold mb-0">{t.fullName}</h6>
                    <span className="badge bg-dark border border-secondary text-primary small">
                      {t.specialization}
                    </span>
                  </div>
                  <p className="text-secondary small mb-2">{t.bio}</p>
                  <div className="d-flex justify-content-between small text-secondary">
                    <span><i className="bi bi-clock me-1 text-info"></i> {t.experienceYears} yrs exp</span>
                    <span><i className="bi bi-tag me-1 text-success"></i> ₹{t.hourlyRate}/session</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slot Selection & Form */}
        <div className="col-12 col-md-7">
          <div className="gym-card p-4">
            <h5 className="fs-6 fw-bold text-white mb-3">
              2. Open Availability Slots for <span className="text-primary">{selectedTrainer?.fullName}</span>
            </h5>

            {slotsLoading ? (
              <LoadingSpinner message="Checking trainer availability..." />
            ) : availabilities.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-calendar-x fs-2 d-block mb-2 text-muted"></i>
                <p className="small mb-0">No available time slots configured by this trainer for upcoming days.</p>
              </div>
            ) : (
              <form onSubmit={handleBookSession}>
                <div className="mb-4">
                  <label className="form-label small text-secondary fw-semibold mb-2">
                    Choose from Open Time Windows:
                  </label>
                  <div className="row g-2">
                    {availabilities.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <div className="col-12 col-sm-6" key={slot.id}>
                          <div
                            className={`p-3 rounded-3 text-center border ${isSelected ? 'border-primary bg-primary bg-opacity-25' : 'border-secondary bg-dark'}`}
                            onClick={() => setSelectedSlot(slot)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="fw-bold text-white small">
                              {formatDate(slot.availabilityDate)}
                            </div>
                            <div className="text-info small mt-1">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-semibold">
                    Purpose / Focus of Session (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control gym-input"
                    placeholder="e.g. Squat technique critique, mobility work"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gym-primary w-100"
                  disabled={submitting || !selectedSlot}
                >
                  {submitting ? 'Confirming Booking...' : 'Request Training Session'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTrainingSession;
