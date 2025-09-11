import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUser } from '../contexts/UserContext';
import { useStartCall, useActiveCall } from '../hooks/useCallQueries';
import { StartCallRequest } from '../types/api.types';
import './StartCall.css';

export const StartCall: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { data: activeCall } = useActiveCall(user?.email || '', !!user);
  const startCallMutation = useStartCall();
  const [isStartingCall, setIsStartingCall] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StartCallRequest>({
    defaultValues: {
      datatechName: user?.name || '',
      datatechEmail: user?.email || '',
    },
  });

  // Update form when user context changes
  useEffect(() => {
    if (user) {
      setValue('datatechName', user.name);
      setValue('datatechEmail', user.email);
    }
  }, [user, setValue]);

  // Redirect if there's already an active call (but not during submission or when coming from end call)
  useEffect(() => {
    const fromEndCall = location.state?.fromEndCall;
    if (activeCall && !isStartingCall && !fromEndCall) {
      navigate('/active-call');
    }
  }, [activeCall, navigate, isStartingCall, location.state?.fromEndCall]);

  const onSubmit = async (data: StartCallRequest) => {

    try {
      setIsStartingCall(true);

      const result = await startCallMutation.mutateAsync(data);


      if (!result) {
        throw new Error('Mutation returned null/undefined result');
      }

      const navigationState = {
        callData: result,
        fromStartCall: true
      };


      try {
        navigate('/active-call', {
          state: navigationState,
          replace: true
        });
      } catch (navError) {
        console.error('StartCall: Navigation failed:', navError);
        throw navError;
      }

      setIsStartingCall(false);

    } catch (error) {
      console.error('=== StartCall: Error in onSubmit ===');
      console.error('StartCall: Error type:', typeof error);
      console.error(
        'StartCall: Error message:',
        error instanceof Error ? error.message : String(error)
      );
      console.error('StartCall: Full error:', error);
      setIsStartingCall(false);
    }

  };

  return (
    <div className="start-call-page">
      <div className="page-header">
        <h2>Start New Call</h2>
        <p className="subtitle">Begin tracking a new support call</p>
      </div>

      <div className="start-call-container">
        <form onSubmit={handleSubmit(onSubmit)} className="start-call-form">
          <div className="form-card">
            <h3>Datatech Information</h3>
            <p className="form-description">
              Confirm your details to start the call
            </p>

            <div className="form-group">
              <label htmlFor="datatechName">Your Name *</label>
              <input
                id="datatechName"
                type="text"
                {...register('datatechName', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className={errors.datatechName ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.datatechName && (
                <span className="error-message">{errors.datatechName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="datatechEmail">Your Email *</label>
              <input
                id="datatechEmail"
                type="email"
                {...register('datatechEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={errors.datatechEmail ? 'error' : ''}
                placeholder="your.email@company.com"
              />
              {errors.datatechEmail && (
                <span className="error-message">{errors.datatechEmail.message}</span>
              )}
            </div>

            <div className="form-info">
              <div className="info-item">
                <span className="info-icon">ℹ️</span>
                <span>Call will be tracked from the moment you click "Start Call"</span>
              </div>
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <span>Timer will begin immediately upon call creation</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📝</span>
                <span>You can add call details after starting the call</span>
              </div>
            </div>

            {startCallMutation.isError && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <span>Failed to start call. Please try again.</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isStartingCall || startCallMutation.isPending}
              >
                {startCallMutation.isPending ? (
                  <>
                    <span className="spinner"></span>
                    Starting Call...
                  </>
                ) : (
                  <>
                    📞 Start Call
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="start-call-sidebar">
          <div className="sidebar-card">
            <h4>Quick Tips</h4>
            <ul className="tips-list">
              <li>Make sure your details are correct before starting</li>
              <li>You can only have one active call at a time</li>
              <li>Remember to end the call when finished</li>
              <li>Add detailed notes during or after the call</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h4>Need Help?</h4>
            <p>If you're having issues starting a call:</p>
            <ul className="help-list">
              <li>Check your internet connection</li>
              <li>Ensure you're logged in correctly</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};