import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { StartCall } from '../pages/StartCall';
import { ActiveCall } from '../pages/ActiveCall';
import { CallHistory } from '../pages/CallHistory';
import { EditCall } from '../pages/EditCall';
import { Reports } from '../pages/Reports';
import { SimpleLogin } from '../components/auth/SimpleLogin';
import { useUser } from '../contexts/UserContext';

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useUser();

  // Show login form if user is not authenticated
  if (!isAuthenticated) {
    return <SimpleLogin />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="start-call" element={<StartCall />} />
        <Route path="active-call" element={<ActiveCall />} />
        <Route path="history" element={<CallHistory />} />
        <Route path="edit-call/:callId" element={<EditCall />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};