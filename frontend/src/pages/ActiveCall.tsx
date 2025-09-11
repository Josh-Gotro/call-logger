import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUser } from '../contexts/UserContext';
import { useActiveCall, useUpdateCall, useEndCall } from '../hooks/useCallQueries';
import { useAllReferenceData } from '../hooks/useReferenceQueries';
import { useLiveDuration } from '../hooks/useLiveDuration';
import { UpdateCallRequest } from '../types/api.types';
import './ActiveCall.css';

interface ActiveCallFormData {
  isInbound: string;
  programManagementParentId: string;
  programManagementChildId: string;
  categoryId: string;
  subjectId: string;
  isAgent: string;
  comments: string;
}

export const ActiveCall: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Use call data from navigation state if available, otherwise from query
  const callDataFromState = location.state?.callData;
  const { data: queriedActiveCall, isLoading } = useActiveCall(user?.email || '', !!user);
  const activeCall = callDataFromState || queriedActiveCall;


  const { programManagement, categories, subjects } = useAllReferenceData();
  const updateCallMutation = useUpdateCall();
  const endCallMutation = useEndCall();
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<ActiveCallFormData>({
    defaultValues: {
      isInbound: 'yes', // Default to inbound
      isAgent: 'no',    // Default to end user (not agent)
    }
  });

  const selectedParentId = watch('programManagementParentId');

  // Clear child selection when parent changes or has no children
  useEffect(() => {
    const selectedParent = programManagement.data?.find(p => p.id === selectedParentId);
    const hasChildren = selectedParent?.children && selectedParent.children.length > 0;

    if (!hasChildren) {
      setValue('programManagementChildId', '');
    }
  }, [selectedParentId, programManagement.data, setValue]);

  // Redirect logic using navigation state data priority
  useEffect(() => {
    const fromStartCall = location.state?.fromStartCall;


    // If we have call data from navigation state, we're good to go
    if (callDataFromState) {
      return; // No need to redirect
    }

    // If we came from starting a call but don't have state data, wait briefly for query
    if (fromStartCall) {
      const timer = setTimeout(() => {
        if (!queriedActiveCall && !isLoading) {
          console.warn('ActiveCall: No active call found after starting call, redirecting to dashboard');
          navigate('/', { state: { message: 'Call was started but could not be loaded. Please check your call history.' } });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Normal case - redirect immediately if no active call from query
      if (!isLoading && !queriedActiveCall) {
        navigate('/');
      }
    }
  }, [callDataFromState, queriedActiveCall, isLoading, navigate, location.state?.fromStartCall]);

  // Initialize form with current call data or defaults
  useEffect(() => {
    if (activeCall) {
      // Check if this is a new call (no category/subject set) - use frontend defaults
      const isNewCall = !activeCall.category && !activeCall.subject && !activeCall.programManagement;
      
      if (isNewCall) {
        // For new calls, use our preferred defaults regardless of backend values
        setValue('isInbound', 'yes');
        setValue('isAgent', 'no');
      } else {
        // For existing calls with data, use the saved values
        setValue('isInbound', activeCall.isInbound ? 'yes' : 'no');
        setValue('isAgent', activeCall.isAgent ? 'yes' : 'no');
      }
      
      setValue('comments', activeCall.comments || '');

      // Note: We need to find IDs from the display names
      // This is a limitation - the API returns names but we need IDs for form submission
      // For existing calls, we'll try to match by name

      if (activeCall.category && categories.data) {
        const category = categories.data.find(c => c.name === activeCall.category);
        if (category) {
          setValue('categoryId', category.id);
        }
      }

      if (activeCall.subject && subjects.data) {
        const subject = subjects.data.find(s => s.name === activeCall.subject);
        if (subject) {
          setValue('subjectId', subject.id);
        }
      }

      // For program management, we need to parse the display string
      // Format is typically "Parent > Child" or just "Parent"
      if (activeCall.programManagement && programManagement.data) {
        const parts = activeCall.programManagement.split(' > ');
        const parentName = parts[0];
        const childName = parts[1];

        const parent = programManagement.data.find(p => p.name === parentName);
        if (parent) {
          setValue('programManagementParentId', parent.id);

          if (childName && parent.children) {
            const child = parent.children.find(c => c.name === childName);
            if (child) {
              setValue('programManagementChildId', child.id);
            }
          }
        }
      }
    } else {
      // No active call - set defaults
      setValue('isInbound', 'yes');
      setValue('isAgent', 'no');
    }
  }, [activeCall, setValue, categories.data, subjects.data, programManagement.data]);


  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  const onSubmit = async (data: ActiveCallFormData) => {
    if (!activeCall) return;

    try {
      const updateData: UpdateCallRequest = {
        isInbound: data.isInbound === 'yes',
        isAgent: data.isAgent === 'yes',
        comments: data.comments || undefined,
      };

      // Add IDs only if selected
      if (data.programManagementParentId) {
        updateData.programManagementParentId = data.programManagementParentId;
      }
      if (data.programManagementChildId) {
        updateData.programManagementChildId = data.programManagementChildId;
      }
      if (data.categoryId) {
        updateData.categoryId = data.categoryId;
      }
      if (data.subjectId) {
        updateData.subjectId = data.subjectId;
      }

      await updateCallMutation.mutateAsync({
        callId: activeCall.id,
        request: updateData,
      });
    } catch (error) {
      console.error('Failed to update call:', error);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;

    try {
      // First, save any pending form changes
      const formData = watch(); // Get current form values
      if (isDirty) {
        const updateData: UpdateCallRequest = {
          isInbound: formData.isInbound === 'yes',
          isAgent: formData.isAgent === 'yes',
          comments: formData.comments || undefined,
        };

        // Add IDs only if selected
        if (formData.programManagementParentId) {
          updateData.programManagementParentId = formData.programManagementParentId;
        }
        if (formData.programManagementChildId) {
          updateData.programManagementChildId = formData.programManagementChildId;
        }
        if (formData.categoryId) {
          updateData.categoryId = formData.categoryId;
        }
        if (formData.subjectId) {
          updateData.subjectId = formData.subjectId;
        }

        // Update the call first
        await updateCallMutation.mutateAsync({
          callId: activeCall.id,
          request: updateData,
        });
      }

      // Then end the call
      await endCallMutation.mutateAsync(activeCall.id);
      // Use replace: true to avoid going back to active call, and add a flag to prevent auto-redirect
      navigate('/start-call', {
        state: { message: 'Call ended successfully', fromEndCall: true },
        replace: true
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading active call...</div>;
  }

  if (!activeCall) {
    return <div className="no-active-call">No active call found</div>;
  }

  // Get children for selected parent
  const selectedParent = programManagement.data?.find(p => p.id === selectedParentId);
  const availableChildren = selectedParent?.children || [];

  return (
    <div className="active-call-page">
      <div className="page-header">
        <div className="call-status">
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Call in Progress</span>
          </div>
          <div className="call-timer">
            <span className="timer-label">Duration:</span>
            <span className="timer-value">{liveDuration}</span>
          </div>
        </div>
        <div className="call-info">
          <h2>Active Call Details</h2>
          <p>Started at {formatTime(activeCall.startTime)}</p>
        </div>
      </div>

      <div className="active-call-container">
        <form onSubmit={handleSubmit(onSubmit)} className="call-form">
          <div className="form-section">
            <h3>Call Classification</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Call Type</label>
                <div className="toggle-group">
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="yes"
                      defaultChecked={true}
                      {...register('isInbound')}
                    />
                    <span className="toggle-label">Inbound</span>
                  </label>
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="no"
                      defaultChecked={false}
                      {...register('isInbound')}
                    />
                    <span className="toggle-label">Outbound</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Is Caller an Agent?</label>
                <div className="toggle-group">
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="no"
                      defaultChecked={true}
                      {...register('isAgent')}
                    />
                    <span className="toggle-label">No</span>
                  </label>
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="yes"
                      defaultChecked={false}
                      {...register('isAgent')}
                    />
                    <span className="toggle-label">Yes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Management Program</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select {...register('programManagementParentId')}>
                  <option value="">Select Department</option>
                  {programManagement.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{
                visibility: selectedParentId && availableChildren.length > 0 ? 'visible' : 'hidden'
              }}>
                <label>Sub-Department</label>
                <select
                  {...register('programManagementChildId', {
                    validate: (value) => {
                      const selectedParent = programManagement.data?.find(p => p.id === selectedParentId);
                      const hasChildren = selectedParent?.children && selectedParent.children.length > 0;
                      
                      if (hasChildren && !value) {
                        return 'Sub-Department is required when Department has sub-departments';
                      }
                      return true;
                    }
                  })}
                  disabled={!selectedParentId || availableChildren.length === 0}
                >
                  <option value="">Select Sub-Department</option>
                  {availableChildren.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.programManagementChildId && (
                  <div className="error-message">
                    {errors.programManagementChildId.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Call Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select {...register('categoryId')}>
                  <option value="">Select Category</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select {...register('subjectId')}>
                  <option value="">Select Subject</option>
                  {subjects.data?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Comments</h3>
            <div className="form-group">
              <textarea
                {...register('comments')}
                placeholder="Add any additional notes about this call..."
                rows={4}
                className="comments-textarea"
              />
            </div>
          </div>

          <div className="form-actions">
            {updateCallMutation.isError && (
              <div className="error-message">
                Failed to update call. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isDirty || updateCallMutation.isPending || Object.keys(errors).length > 0}
            >
              {updateCallMutation.isPending ? 'Updating...' : 'Update Call'}
            </button>
          </div>
        </form>

        <div className="call-sidebar">
          <div className="sidebar-card call-summary">
            <h4>Call Summary</h4>
            <div className="summary-item">
              <span>Datatech:</span>
              <span>{activeCall.datatechName}</span>
            </div>
            <div className="summary-item">
              <span>Email:</span>
              <span>{activeCall.datatechEmail}</span>
            </div>
            <div className="summary-item">
              <span>Started:</span>
              <span>{formatTime(activeCall.startTime)}</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>{liveDuration}</span>
            </div>
          </div>

          <div className="sidebar-card end-call-section">
            <h4>End Call</h4>
            <p>When you're finished with this call, click the button below to end it.</p>

            {!showEndConfirm ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowEndConfirm(true)}
              >
                End Call
              </button>
            ) : (
              <div className="end-call-confirm">
                <p><strong>Are you sure?</strong></p>
                <p>This will stop the timer and mark the call as completed.</p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEndConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleEndCall}
                    disabled={endCallMutation.isPending || Object.keys(errors).length > 0}
                  >
                    {endCallMutation.isPending ? 'Ending...' : 'Confirm End Call'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};