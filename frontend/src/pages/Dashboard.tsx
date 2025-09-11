import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useActiveCall, useTodaysRecentCalls, useTodaysCalls } from '../hooks/useCallQueries';
import { useLiveDuration } from '../hooks/useLiveDuration';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: activeCall, isLoading: activeCallLoading } = useActiveCall(user?.email || '', !!user);
  const { data: recentCalls, isLoading: recentCallsLoading } = useTodaysRecentCalls(user?.email || '');
  const { data: todaysCalls, isLoading: todaysCallsLoading } = useTodaysCalls(user?.email || '');
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (activeCallLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome{todaysCalls?.totalElements && todaysCalls.totalElements > 0 ? ' back' : ''}, {user?.name}!</h2>
        <p className="subtitle">DataTech Call Management Dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Active Call Card */}
        <div className="dashboard-card active-call-card">
          <h3>Current Status</h3>
          {activeCall ? (
            <div className="active-call-info">
              <div className="status-indicator active">
                <span className="status-dot"></span>
                <span>Call in Progress</span>
              </div>
              <div className="call-details">
                <p><strong>Started:</strong> {formatDate(activeCall.startTime)}</p>
                <p><strong>Duration:</strong> {liveDuration}</p>
                {activeCall.category && <p><strong>Category:</strong> {activeCall.category}</p>}
                {activeCall.subject && <p><strong>Subject:</strong> {activeCall.subject}</p>}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/active-call')}
              >
                Manage Active Call
              </button>
            </div>
          ) : (
            <div className="no-active-call">
              <div className="status-indicator ready">
                <span className="status-dot ready"></span>
                <span>Ready for Calls</span>
              </div>
              <p>No active call at the moment</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/start-call')}
              >
                Start New Call
              </button>
            </div>
          )}
        </div>


        {/* Today's Stats Card */}
        <div className="dashboard-card stats-card">
          <h3>Today's Statistics</h3>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">
                {todaysCallsLoading ? '...' : (todaysCalls?.totalElements || 0)}
              </span>
              <span className="stat-label">Calls Today</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {activeCall ? 'Active' : 'Ready'}
              </span>
              <span className="stat-label">Current Status</span>
            </div>
          </div>
        </div>

        {/* Recent Calls Card */}
        <div className="dashboard-card recent-calls-card">
          <h3>Today's 5 Most Recent Calls</h3>
          {recentCallsLoading ? (
            <p>Loading recent calls...</p>
          ) : recentCalls && recentCalls.content.length > 0 ? (
            <div className="recent-calls-list">
              {recentCalls.content.map((call) => (
                <div 
                  key={call.id} 
                  className="recent-call-item clickable"
                  onClick={() => navigate(`/edit-call/${call.id}`)}
                >
                  <div className="call-info">
                    <span className="call-time">{formatDate(call.startTime)}</span>
                    <span className="call-duration">{formatDuration(call.durationMinutes)}</span>
                  </div>
                  <div className="call-meta">
                    {call.category && <span className="tag">{call.category}</span>}
                    {call.subject && <span className="tag">{call.subject}</span>}
                  </div>
                </div>
              ))}
              <button
                className="btn btn-link"
                onClick={() => navigate('/history')}
              >
                View All Calls →
              </button>
            </div>
          ) : (
            <p>No calls today yet</p>
          )}
        </div>
      </div>
    </div>
  );
};