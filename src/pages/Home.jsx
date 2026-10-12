import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membershipApi } from '../api/membershipApi';
import { trainerApi } from '../api/trainerApi';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, trainersData] = await Promise.all([
          membershipApi.getPlans(true),
          trainerApi.getAllTrainers(true),
        ]);
        setPlans(Array.isArray(plansData) ? plansData : (plansData?.data || []));
        setTrainers(Array.isArray(trainersData) ? trainersData : (trainersData?.data || []));
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-light">
      {/* Clean Modern Hero Section */}
      <section className="py-5 py-lg-6 bg-white border-bottom">
        <div className="container py-3 py-lg-4">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-3 small fw-semibold">
                <i className="bi bi-shield-check me-1"></i> Smart Fitness & Operations Platform
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Empower Your Fitness Journey With Smart Management
              </h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                A streamlined gym operations platform bringing memberships, certified personal coaching, daily attendance check-ins, and structured workout routines together in one place.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Link to="/register" className="btn btn-gym-primary btn-lg px-4 py-2">
                  <i className="bi bi-person-plus-fill me-1"></i> Get Started
                </Link>
                <a href="#plans" className="btn btn-gym-outline btn-lg px-4 py-2">
                  <i className="bi bi-tag me-1"></i> View Plans
                </a>
                <Link to="/login" className="btn btn-gym-secondary btn-lg px-3 py-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Member Login
                </Link>
              </div>

              {/* Quick Key Highlights */}
              <div className="row g-2 pt-2 text-secondary small">
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span>Verified Subscriptions</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span>1-Click Daily Check-in</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span>Certified Trainers</span>
                </div>
              </div>
            </div>

            {/* Hero Image with Graceful Fallback */}
            <div className="col-lg-6 text-center">
              <div className="position-relative mx-auto" style={{ maxWidth: '540px' }}>
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80"
                  alt="Modern Gym Facility"
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ maxHeight: '380px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'block';
                    }
                  }}
                />
                {/* Fallback box if offline or network blocks remote images */}
                <div
                  className="rounded-4 p-5 text-center bg-light border"
                  style={{ display: 'none', minHeight: '260px' }}
                >
                  <i className="bi bi-building fs-1 text-primary mb-2 d-block"></i>
                  <h5 className="text-dark fw-bold">SmartGym Center</h5>
                  <p className="text-secondary small mb-0">State-of-the-art strength and cardio training spaces.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards with Relevant Images */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill mb-2 small fw-semibold">
              CORE FEATURES
            </span>
            <h2 className="fw-bold text-dark mb-2">Designed for Every Step of Your Workout</h2>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '580px' }}>
              Clean digital tools to ensure consistent training, transparent accountability, and measurable results.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="gym-card h-100 p-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80"
                  alt="Modern Gym Facilities"
                  className="w-100"
                  style={{ height: '180px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-2 p-1 px-2 small">
                      <i className="bi bi-buildings"></i>
                    </span>
                    <h5 className="fw-bold text-dark mb-0">Modern Facilities</h5>
                  </div>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    Full access to premium strength zones, cardio equipment, and dedicated locker rooms with flexible membership plans.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="gym-card h-100 p-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80"
                  alt="Personal Coaching"
                  className="w-100"
                  style={{ height: '180px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-2 p-1 px-2 small">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <h5 className="fw-bold text-dark mb-0">Certified Coaches</h5>
                  </div>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    Book 1-on-1 sessions with experienced trainers who build structured workout routines and support your fitness progression.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="gym-card h-100 p-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
                  alt="Smart Attendance and Tracking"
                  className="w-100"
                  style={{ height: '180px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-info-subtle text-info border border-info-subtle rounded-2 p-1 px-2 small">
                      <i className="bi bi-graph-up-arrow"></i>
                    </span>
                    <h5 className="fw-bold text-dark mb-0">Smart Tracking</h5>
                  </div>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    Check in with a single click, view your payment receipts, and record personal fitness metrics directly from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Membership Plans Section */}
      <section id="plans" className="py-5 bg-white border-top border-bottom">
        <div className="container py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
            <div>
              <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill mb-2 small fw-semibold">
                PACKAGES
              </span>
              <h2 className="fw-bold text-dark mb-1">Membership Plans</h2>
              <p className="text-secondary mb-0 small">Flexible options backed by persistent database records.</p>
            </div>
            <Link to="/plans" className="btn btn-gym-outline btn-sm">
              View All Details <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading membership plans..." />
          ) : plans.length === 0 ? (
            <div className="gym-card p-5 text-center text-muted">
              <i className="bi bi-card-checklist fs-1 mb-2 text-secondary"></i>
              <h6 className="text-dark">No Membership Plans Configured</h6>
              <p className="small mb-0">Plans will appear as soon as the administrator initializes them.</p>
            </div>
          ) : (
            <div className="row g-4">
              {plans.slice(0, 4).map((plan, index) => {
                const isPopular = plan.name?.toLowerCase().includes('quarterly') || index === 1;
                return (
                  <div key={plan.id} className="col-md-6 col-lg-3">
                    <div className={`plan-card ${isPopular ? 'featured' : ''}`}>
                      {isPopular && <div className="plan-badge-featured">Popular</div>}
                      <h4 className="fw-bold text-dark fs-5 mb-1">{plan.name}</h4>
                      <p className="text-secondary small mb-2">{plan.durationDays} Days Full Access</p>

                      <div className="plan-price">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="plan-duration">
                        Standard Gym Membership
                      </div>

                      <div className="border-top pt-3 mb-4 flex-grow-1">
                        <ul className="plan-features-list mb-0">
                          <li>
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span>Gym floor access</span>
                          </li>
                          <li>
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span>Standard lockers & amenities</span>
                          </li>
                          <li>
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span>Daily attendance tracking</span>
                          </li>
                          {plan.includesPersonalTraining && (
                            <li>
                              <i className="bi bi-star-fill text-warning"></i>
                              <span className="fw-semibold text-dark">Personal Coach Included</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <Link to="/register" className={`btn w-100 ${isPopular ? 'btn-gym-primary' : 'btn-gym-outline'}`}>
                        Choose Plan
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Certified Trainers Showcase */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill mb-2 small fw-semibold">
              OUR TEAM
            </span>
            <h2 className="fw-bold text-dark mb-2">Certified Personal Trainers</h2>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '520px' }}>
              Qualified fitness professionals dedicated to helping you achieve your physical goals.
            </p>
          </div>

          <div className="row g-4">
            {trainers.map((t) => (
              <div key={t.id} className="col-md-6 col-lg-3">
                <div className="gym-card h-100 p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold fs-5 bg-light border" style={{ width: '46px', height: '46px' }}>
                      {t.fullName ? t.fullName.charAt(0) : 'T'}
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{t.fullName}</h6>
                      <small className="text-success fw-medium">{t.experienceYears} Years Exp</small>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="badge bg-light border text-secondary small fw-normal">
                      {t.specialization || 'Fitness Trainer'}
                    </span>
                  </div>

                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {t.bio || 'Specializes in athletic training, resistance exercise, and fitness conditioning.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
