import React from 'react';
import { formatCurrency } from '../utils/formatters';

const MembershipCard = ({ plan, onSelect, isCurrentPlan = false, disabled = false }) => {
  const isAnnual = plan.name?.toLowerCase().includes('annual');

  const facilityList = plan.facilities
    ? plan.facilities.split(',').map((f) => f.trim())
    : ['Gym floor access', 'Standard lockers'];

  return (
    <div className={`plan-card ${isAnnual ? 'featured' : ''}`}>
      {isAnnual && <div className="plan-badge-featured">Most Popular</div>}
      <h3 className="fs-5 fw-bold mb-1 text-dark">{plan.name}</h3>
      <p className="text-secondary small mb-2">{plan.description}</p>
      <div className="plan-price">
        {formatCurrency(plan.price)}
      </div>
      <div className="plan-duration">
        Valid for <strong className="text-dark">{plan.durationDays} days</strong>
      </div>

      <ul className="plan-features-list">
        {facilityList.map((facility, index) => (
          <li key={index}>
            <i className="bi bi-check-circle-fill"></i>
            <span>{facility}</span>
          </li>
        ))}
        {plan.includesPersonalTraining && (
          <li>
            <i className="bi bi-star-fill text-warning"></i>
            <span className="fw-semibold text-dark">Personal Training Included</span>
          </li>
        )}
      </ul>

      <div className="mt-auto pt-3">
        {isCurrentPlan ? (
          <button className="btn btn-secondary w-100 disabled py-2" disabled>
            <i className="bi bi-check2 me-1"></i> Current Plan
          </button>
        ) : onSelect ? (
          <button
            className={`btn ${isAnnual ? 'btn-gym-primary' : 'btn-gym-outline'} w-100 py-2`}
            onClick={() => onSelect(plan)}
            disabled={disabled}
          >
            {disabled ? 'Unavailable' : 'Choose Plan'}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default MembershipCard;
