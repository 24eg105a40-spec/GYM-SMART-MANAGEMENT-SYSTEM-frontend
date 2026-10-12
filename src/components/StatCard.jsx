import React from 'react';

const StatCard = ({ title, value, icon, color = '#0284c7', subtitle }) => {
  return (
    <div className="stat-widget">
      <div>
        <p className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
          {title}
        </p>
        <h2 className="fs-3 fw-bold mb-0 text-dark">{value}</h2>
        {subtitle && <p className="text-muted small mt-1 mb-0">{subtitle}</p>}
      </div>
      <div
        className="stat-icon"
        style={{
          backgroundColor: `${color}14`,
          color: color,
          border: `1px solid ${color}28`,
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatCard;
