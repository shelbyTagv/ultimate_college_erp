import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

import Home from './pages/public/Home'
import About from './pages/public/About'
import Admissions from './pages/public/Admissions'
import Academics from './pages/public/Academics'
import NewsEvents from './pages/public/NewsEvents'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApplications from './pages/admin/AdminApplications'
import AdminClasses from './pages/admin/AdminClasses'
import AdminStudents from './pages/admin/AdminStudents'
import AdminTeachers from './pages/admin/AdminTeachers'
import AdminReports from './pages/admin/AdminReports'
import AdminFinance from './pages/admin/AdminFinance'
import AdminMessages from './pages/admin/AdminMessages'

import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClasses from './pages/teacher/TeacherClasses'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherResults from './pages/teacher/TeacherResults'
import TeacherMessages from './pages/teacher/TeacherMessages'

import StudentDashboard from './pages/student/StudentDashboard'
import StudentAssignments from './pages/student/StudentAssignments'
import StudentResults from './pages/student/StudentResults'
import StudentFees from './pages/student/StudentFees'
import StudentLibrary from './pages/student/StudentLibrary'
import StudentMessages from './pages/student/StudentMessages'

import ParentDashboard from './pages/parent/ParentDashboard'
import ParentMessages from './pages/parent/ParentMessages'

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="academics" element={<Academics />} />
        <Route path="news" element={<NewsEvents />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="/admin" element={<PrivateRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_STAFF']}><DashboardLayout role="admin" /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      <Route path="/teacher" element={<PrivateRoute allowedRoles={['TEACHER']}><DashboardLayout role="teacher" /></PrivateRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="messages" element={<TeacherMessages />} />
      </Route>

      <Route path="/student" element={<PrivateRoute allowedRoles={['STUDENT']}><DashboardLayout role="student" /></PrivateRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="library" element={<StudentLibrary />} />
        <Route path="messages" element={<StudentMessages />} />
      </Route>

      <Route path="/parent" element={<PrivateRoute allowedRoles={['PARENT']}><DashboardLayout role="parent" /></PrivateRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="messages" element={<ParentMessages />} />
      </Route>

      <Route path="/finance" element={<PrivateRoute allowedRoles={['FINANCE_OFFICER']}><DashboardLayout role="finance" /></PrivateRoute>}>
        <Route index element={<AdminFinance />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
