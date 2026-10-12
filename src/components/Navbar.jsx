import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'TRAINER') return '/trainer/dashboard';
    return '/member/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-white border-bottom shadow-sm py-2">
      <div className="container px-3 px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', width: '36px', height: '36px' }}>
            <i className="bi bi-activity fs-5"></i>
          </div>
          <span className="fw-bold fs-4 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Smart<span className="text-primary">Gym</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicGymNavbar"
          aria-controls="publicGymNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list text-dark fs-3"></i>
        </button>

        <div className="collapse navbar-collapse" id="publicGymNavbar">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <Link className="nav-link text-secondary fw-medium px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-secondary fw-medium px-3" to="/plans">Membership Plans</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="btn btn-gym-primary btn-sm px-3 py-2">
                  <i className="bi bi-speedometer2"></i> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-gym-outline btn-sm px-3 py-2">
                  <i className="bi bi-box-arrow-right"></i> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-gym-outline btn-sm px-3 py-2">
                  <i className="bi bi-box-arrow-in-right"></i> Member Login
                </Link>
                <Link to="/register" className="btn btn-gym-primary btn-sm px-3 py-2">
                  <i className="bi bi-person-plus-fill"></i> Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
