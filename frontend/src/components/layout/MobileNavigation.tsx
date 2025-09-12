import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useActiveCall } from '../../hooks/useCallQueries';
import './MobileNavigation.css';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { data: activeCall } = useActiveCall(user?.email || '', !!user);

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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle navigation item click
  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop (only visible when open) */}
      {isOpen && <div className="mobile-nav-backdrop" onClick={onClose} />}

      {/* Mobile Navigation Drawer - two variants rendered so ARIA attributes use literal values */}
      {isOpen ? (
        <nav id="mobile-navigation-drawer" className="mobile-nav-drawer open" aria-hidden="false">
          <div className="mobile-nav-header">
            <h3>Navigation</h3>
            <button
              className="mobile-nav-close"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav-items">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`
                }
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    handleNavClick();
                  }
                }}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
                {item.path === '/active-call' && activeCall && (
                  <span className="mobile-nav-badge">Active</span>
                )}
                {item.path === '/start-call' && activeCall && (
                  <span className="mobile-nav-badge disabled">In Call</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : (
  <nav id="mobile-navigation-drawer" className="mobile-nav-drawer closed" aria-hidden="true">
          <div className="mobile-nav-header">
            <h3>Navigation</h3>
            <button
              className="mobile-nav-close"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav-items">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`
                }
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    handleNavClick();
                  }
                }}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
                {item.path === '/active-call' && activeCall && (
                  <span className="mobile-nav-badge">Active</span>
                )}
                {item.path === '/start-call' && activeCall && (
                  <span className="mobile-nav-badge disabled">In Call</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
};