import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useActiveCall } from '../../hooks/useCallQueries';
import { useLiveDuration } from '../../hooks/useLiveDuration';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { user } = useUser();
  const { data: activeCall } = useActiveCall(user?.email || '', !!user);
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null);

  const baseNavItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/start-call', label: 'Start New Call', icon: '📞', disabled: !!activeCall },
    { path: '/history', label: 'Call History', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📊' },
  ];

  // Only include Active Call item when there's an active call
  const navItems = activeCall
    ? [
        baseNavItems[0], // Dashboard
        { path: '/active-call', label: 'Active Call', icon: '🔴' },
        baseNavItems[1], // Start New Call (disabled)
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