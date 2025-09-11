import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useActiveCall } from '../../hooks/useCallQueries';
import { useLiveDuration } from '../../hooks/useLiveDuration';
import './Header.css';

interface HeaderProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isMobile, 
  isMobileMenuOpen, 
  onToggleMobileMenu 
}) => {
  const { user, logout } = useUser();
  const { data: activeCall } = useActiveCall(user?.email || '', !!user);
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {isMobile && (
          <button 
            className="hamburger-btn"
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
        <h1 className="app-title">DataTech Call Logger</h1>
        {activeCall && (
          <div className="active-call-indicator">
            <span className="pulse-dot"></span>
            <span> - {liveDuration}</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};