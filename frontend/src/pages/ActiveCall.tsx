import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUser } from '../contexts/UserContext';
import { useActiveCall, useUpdateCall, useEndCall, useStartCall } from '../hooks/useCallQueries';
import { useAllReferenceData } from '../hooks/useReferenceQueries';
import { useLiveDuration } from '../hooks/useLiveDuration';
import { UpdateCallRequest, CallEntry } from '../types/api.types';
import { SearchableSelect } from '../components/forms/SearchableSelect';
import './ActiveCall.css';

interface ActiveCallFormData {
  isInbound: string;
  taskId: string;
  subjectId: string;
  isAgent: string;
}

export const ActiveCall: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  // Store ended call locally after ending so UI can still display details
  const [endedCallData, setEndedCallData] = useState<CallEntry | null>(null);

  // Use call data from navigation state if available, otherwise from query
  const callDataFromState = location.state?.callData as CallEntry | undefined;
  const { data: queriedActiveCall, isLoading } = useActiveCall(user?.email || '', !!user);

  // Priority order: ended call data (local state), navigation state, query data
  const activeCall: CallEntry | null = endedCallData || callDataFromState || queriedActiveCall || null;


  const { tasks, subjects } = useAllReferenceData();
  const updateCallMutation = useUpdateCall();
  const endCallMutation = useEndCall();
  const startCallMutation = useStartCall();
  const { formattedDuration: liveDuration } = useLiveDuration(activeCall?.startTime || null, activeCall?.endTime || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, errors },
  } = useForm<ActiveCallFormData>({
    defaultValues: {
      isInbound: 'yes', // Default to inbound
      isAgent: 'no',    // Default to end user (not agent)
    }
  });

  const selectedTaskId = watch('taskId');

  // Clear subject selection when task changes to one without subjects
  useEffect(() => {
    if (selectedTaskId && tasks.data) {
      const selectedTask = tasks.data.find(t => t.id === selectedTaskId);
      if (selectedTask && !selectedTask.hasSubjects) {
        setValue('subjectId', '');
      }
    }
  }, [selectedTaskId, tasks.data, setValue]);

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
      // Check if this is a new call (no task/subject set) - use frontend defaults
      const isNewCall = !activeCall.taskName && !activeCall.subjectName;

      if (isNewCall) {
        // For new calls, use our preferred defaults regardless of backend values
        setValue('isInbound', 'yes');
        setValue('isAgent', 'no');
      } else {
        // For existing calls with data, use the saved values
        setValue('isInbound', activeCall.isInbound ? 'yes' : 'no');
        setValue('isAgent', activeCall.isAgent ? 'yes' : 'no');
      }


      // TODO: We need to find IDs from the display names
      // This is a limitation - the API returns names but we need IDs for form submission
      // For existing calls, we'll try to match by name

      // Handle Task-Subject model fields
      if (activeCall.taskName && tasks.data) {
        const task = tasks.data.find(t => t.name === activeCall.taskName);
        if (task) {
          setValue('taskId', task.id);
        }
      }

      if (activeCall.subjectName && subjects.data) {
        const subject = subjects.data.find(s => s.name === activeCall.subjectName);
        if (subject) {
          setValue('subjectId', subject.id);
        }
      }
    } else {
      // No active call - set defaults
      setValue('isInbound', 'yes');
      setValue('isAgent', 'no');
    }
  }, [activeCall, setValue, tasks.data, subjects.data]);


  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  const onSubmit = async (data: ActiveCallFormData) => {
    if (!activeCall) return;

    try {
      const updateData: UpdateCallRequest = {
        isInbound: data.isInbound === 'yes',
        isAgent: data.isAgent === 'yes',
      };

      // Add IDs only if selected
      if (data.taskId) {
        updateData.taskId = data.taskId;
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
        };

        // Add IDs only if selected
        if (formData.taskId) {
          updateData.taskId = formData.taskId;
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
      const endedCall = await endCallMutation.mutateAsync(activeCall.id);

      // Update local state to show ended call immediately
      setEndedCallData(endedCall);
      setShowEndConfirm(false);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleStartNewCall = async () => {
    if (!user?.email || !user?.name) return;

    try {
      // Clear the ended call data first
      setEndedCallData(null);

      // Reset form to defaults for new call
      reset({
        isInbound: 'yes',
        isAgent: 'no',
        taskId: '',
        subjectId: ''
      });

      const newCall = await startCallMutation.mutateAsync({
        datatechName: user.name,
        datatechEmail: user.email,
      });

      // Navigate to the active call page with the new call data
      navigate('/active-call', {
        state: {
          callData: newCall,
          fromStartCall: true
        },
        replace: true
      });
    } catch (error) {
      console.error('Failed to start new call:', error);
      // If there's an error (like active call exists), clear the ended call data anyway
      // so the UI reflects the current state
      setEndedCallData(null);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading active call...</div>;
  }

  if (!activeCall) {
    return <div className="no-active-call">No active call found</div>;
  }

  // Task-Subject model: Get selected task and check if it has subjects
  const selectedTask = selectedTaskId && tasks.data ?
    tasks.data.find(t => t.id === selectedTaskId) : null;
  const selectedTaskHasSubjects = selectedTask?.hasSubjects || false;
  const availableSubjects = selectedTask?.subjects || [];

  return (
    <div className="active-call-page">
      <div className={`page-header ${activeCall.endTime ? 'call-ended' : 'call-active'}`}>
        <div className="call-info">
          <h2>{activeCall.endTime ? 'Call Ended' : 'Active Call'}</h2>
          <p>
            Started at {formatTime(activeCall.startTime)}
            {activeCall.endTime && ` • Ended at ${formatTime(activeCall.endTime)}`}
          </p>
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
            <h3>Call Details</h3>

            <div className="form-row">
              <div className="form-group">
                <SearchableSelect
                  name="taskId"
                  label="Task"
                  placeholder="Search and select task"
                  options={tasks.data || []}
                  value={watch('taskId')}
                  register={register}
                  setValue={setValue}
                  onSelectionChange={(value, option) => {
                    // Clear subject when task changes to one without subjects
                    if (option && !option.hasSubjects) {
                      setValue('subjectId', '');
                    }
                  }}
                />
              </div>

              <div className="form-group" style={{ visibility: selectedTaskHasSubjects ? 'visible' : 'hidden' }}>
                <SearchableSelect
                  name="subjectId"
                  label="Subject"
                  placeholder="Search and select subject"
                  options={availableSubjects}
                  value={watch('subjectId')}
                  disabled={!selectedTaskHasSubjects}
                  register={register}
                  setValue={setValue}
                />
              </div>
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
          <div className="sidebar-card call-status-card">
            <div className="call-status-header">
              <div className="status-indicator">
                <span className={`status-dot ${activeCall.endTime ? 'completed' : 'active'}`}></span>
                <span className={`status-text ${activeCall.endTime ? 'completed' : ''}`}>
                  {activeCall.endTime ? 'Call Completed' : 'Call in Progress'}
                </span>
              </div>
            </div>
            <div className="call-timer-display">
              <span className="timer-label">Duration:</span>
              <span className={`timer-value ${activeCall.endTime ? 'ended' : ''}`}>{liveDuration}</span>
            </div>
          </div>

          {!activeCall.endTime ? (
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
          ) : (
            <div className="sidebar-card start-new-call-section">
              <h4>Start New Call</h4>
              <p>This call is complete. Ready to start a new call?</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartNewCall}
                disabled={startCallMutation.isPending}
              >
                {startCallMutation.isPending ? 'Starting...' : 'Start New Call'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};