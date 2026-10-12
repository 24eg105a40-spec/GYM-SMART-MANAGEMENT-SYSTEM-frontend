import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MemberLayout from './layouts/MemberLayout';
import TrainerLayout from './layouts/TrainerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import MembershipPlans from './pages/member/MembershipPlans';
import MyMembership from './pages/member/MyMembership';
import PaymentHistory from './pages/member/PaymentHistory';
import MyAttendance from './pages/member/MyAttendance';
import MyWorkoutPlans from './pages/member/MyWorkoutPlans';
import FitnessProgress from './pages/member/FitnessProgress';
import BookTrainingSession from './pages/member/BookTrainingSession';
import MyTrainingSessions from './pages/member/MyTrainingSessions';
import MemberProfile from './pages/member/MemberProfile';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerMembers from './pages/trainer/TrainerMembers';
import ManageWorkoutPlans from './pages/trainer/ManageWorkoutPlans';
import WorkoutPlanForm from './pages/trainer/WorkoutPlanForm';
import ManageAvailability from './pages/trainer/ManageAvailability';
import TrainerSessions from './pages/trainer/TrainerSessions';
import MemberProgress from './pages/trainer/MemberProgress';
import TrainerProfile from './pages/trainer/TrainerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import ManageTrainers from './pages/admin/ManageTrainers';
import ManageMembershipPlans from './pages/admin/ManageMembershipPlans';
import ManageMemberships from './pages/admin/ManageMemberships';
import ManagePayments from './pages/admin/ManagePayments';
import ManageAttendance from './pages/admin/ManageAttendance';
import ManageAssignments from './pages/admin/ManageAssignments';
import ManageTrainingSessions from './pages/admin/ManageTrainingSessions';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<MembershipPlans />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Member Protected Routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['MEMBER']}>
                  <MemberLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="plans" element={<MembershipPlans />} />
            <Route path="my-membership" element={<MyMembership />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="workouts" element={<MyWorkoutPlans />} />
            <Route path="progress" element={<FitnessProgress />} />
            <Route path="book-session" element={<BookTrainingSession />} />
            <Route path="sessions" element={<MyTrainingSessions />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Trainer Protected Routes */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['TRAINER']}>
                  <TrainerLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/trainer/dashboard" replace />} />
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="members" element={<TrainerMembers />} />
            <Route path="workout-plans" element={<ManageWorkoutPlans />} />
            <Route path="workout-plans/new" element={<WorkoutPlanForm />} />
            <Route path="workout-plans/:id/edit" element={<WorkoutPlanForm />} />
            <Route path="availability" element={<ManageAvailability />} />
            <Route path="sessions" element={<TrainerSessions />} />
            <Route path="member-progress/:memberId" element={<MemberProgress />} />
            <Route path="profile" element={<TrainerProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<ManageMembers />} />
            <Route path="trainers" element={<ManageTrainers />} />
            <Route path="membership-plans" element={<ManageMembershipPlans />} />
            <Route path="memberships" element={<ManageMemberships />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="attendance" element={<ManageAttendance />} />
            <Route path="assignments" element={<ManageAssignments />} />
            <Route path="sessions" element={<ManageTrainingSessions />} />
          </Route>

          {/* Catch All 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
