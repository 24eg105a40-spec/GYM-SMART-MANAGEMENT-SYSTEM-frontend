import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-70 text-center py-5">
      <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
      <h2 className="fs-3 text-white mb-3">Page Not Found</h2>
      <p className="text-secondary mb-4" style={{ maxWidth: '480px' }}>
        The requested gym management route does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-gym-primary px-4">
        <i className="bi bi-house-door me-2"></i> Return Home
      </Link>
    </div>
  );
};

export default NotFound;
