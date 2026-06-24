import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';import Login from '../components/Login'; 
import Register from '../components/Register';
import ReportIssue from '../components/ReportIssue';
import AdminDashboard from '../components/AdminDashboard';
import AdminUsers from '../components/AdminUsers';
import AdminIssuesList from '../components/AdminIssuesList';
import RegisterEngineer from '../components/RegisterEngineer';

// 🔒 البواب بتاع الفرونت إند (بيسمح فقط لليوزر العادي بالدخول)
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // لو مش عامل لوجين، ارجع لصفحة اللوجين
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // لو أدمن، اطرده برة الصفحة دي ووديه الصفحة اللي يعجبك (مؤقتاً رجعته للوجين أو الـ Dashboard بتاعتك)
  if (role === 'admin') {
    return <Navigate to="/" replace />; 
  }

  // لو يوزر عادي، عَدّيه يشوف صفحة البلاغات
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Login />} />  
        <Route path="/users" element={<AdminUsers />} />     
        <Route path="/admin-issues-list" element={<AdminIssuesList />} /> 
        <Route path="/registerEngineer" element={<RegisterEngineer />} />


      </Routes>
    </Router>
  );
}

export default App;