import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

export const SimpleLogin: React.FC = () => {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    login(name.trim(), email.trim());
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: '#212529', fontSize: '1.75rem' }}>
            DataTech Call Logger
          </h1>
          <p style={{ margin: '0', color: '#6c757d', fontSize: '0.95rem' }}>
            Please enter your details to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={inputStyle}
            />
            {errors.name && (
              <span style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                {errors.name}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              style={inputStyle}
            />
            {errors.email && (
              <span style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                {errors.email}
              </span>
            )}
          </div>
          
          <button type="submit" style={buttonStyle}>
            Continue to Dashboard
          </button>
        </form>
        
        <div style={{ textAlign: 'center', borderTop: '1px solid #e9ecef', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.85rem' }}>
            This is a simple session for demo purposes.
          </p>
          <p style={{ margin: '0', color: '#6c757d', fontSize: '0.85rem' }}>
            Your information will be stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};