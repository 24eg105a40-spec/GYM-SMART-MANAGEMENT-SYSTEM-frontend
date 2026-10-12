import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-5 bg-white border-top">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 fw-bold fs-5 mb-2">
              <div className="rounded-2 d-flex align-items-center justify-content-center text-white" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', width: '28px', height: '28px' }}>
                <i className="bi bi-activity fs-6"></i>
              </div>
              <span className="text-dark">Smart<span className="text-primary">Gym</span></span>
            </div>
            <p className="text-secondary small pe-md-4 mb-3" style={{ lineHeight: 1.6 }}>
              A modern gym management and membership tracking platform built with Java Spring Boot, React, and MySQL. Streamlining member registrations, attendance records, and personal training.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-light border text-secondary fw-normal">Spring Boot 3</span>
              <span className="badge bg-light border text-secondary fw-normal">React + Vite</span>
              <span className="badge bg-light border text-secondary fw-normal">MySQL Database</span>
              <span className="badge bg-light border text-secondary fw-normal">JWT Security</span>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-dark fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: '0.05em' }}>Navigation</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none hover-primary">Home</Link></li>
              <li className="mb-2"><Link to="/plans" className="text-secondary text-decoration-none hover-primary">Membership Plans</Link></li>
              <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none hover-primary">Member Login</Link></li>
              <li className="mb-2"><Link to="/register" className="text-secondary text-decoration-none hover-primary">Create Account</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-4">
            <h6 className="text-dark fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: '0.05em' }}>Platform Notice</h6>
            <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
              Designed and developed for smart fitness center operations. Supports administrative governance, trainer allocation, and digital membership management.
            </p>
          </div>
        </div>

        <div className="pt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <p className="mb-2 mb-sm-0">
            &copy; {new Date().getFullYear()} Smart Gym Management System. All rights reserved.
          </p>
          <p className="mb-0 text-secondary">
            Secure Full-Stack Fitness Management Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
