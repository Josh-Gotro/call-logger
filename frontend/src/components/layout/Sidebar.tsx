import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useActiveCall, useTodaysRecentCalls } from '../../hooks/useCallQueries';
import { useLiveDuration } from '../../hooks/useLiveDuration';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { user } = useUser();
  const { data: activeCall } = useActiveCall(user?.email || '', !!user);
  const { data: recentCalls } = useTodaysRecentCalls(user?.email || '');
  const mostRecentCall = recentCalls?.content?.[0];
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null);

  const baseNavItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/start-call', label: 'Start New Call', icon: '📞', disabled: !!activeCall },
    { path: '/history', label: 'Call History', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📊' },
  ];

  // Determine call nav item based on active call or most recent call
  let callNavItem = null;
  if (activeCall) {
    callNavItem = { path: '/active-call', label: 'Active Call', icon: '🟢' };
  } else if (mostRecentCall) {
    callNavItem = { 
      path: `/edit-call/${mostRecentCall.id}`, 
      label: 'Most Recent Call', 
      icon: '🔴',
      // Add stable key to prevent navigation issues
      key: `recent-${mostRecentCall.id}`
    };
  }

  // Include call nav item if it exists
  const navItems = callNavItem
    ? [
        baseNavItems[0], // Dashboard
        callNavItem,
        baseNavItems[1], // Start New Call
        baseNavItems[2], // Call History
        baseNavItems[3], // Reports
      ]
    : baseNavItems;

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`
            }
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.path === '/active-call' && activeCall && (
              <span className="nav-badge">Active</span>
            )}
            {item.path.startsWith('/edit-call/') && mostRecentCall && !activeCall && (
              <span className="nav-badge recent">Recent</span>
            )}
            {item.path === '/start-call' && activeCall && (
              <span className="nav-badge disabled">In Call</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="quick-stats">
          {activeCall ? (
            <div className="stat-item">
              <span>Current Call:</span>
              <span className="stat-value">{liveDuration}</span>
            </div>
          ) : (
            <div className="stat-item">
              <span>Status:</span>
              <span className="stat-value">Ready</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};