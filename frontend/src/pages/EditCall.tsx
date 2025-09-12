import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCall, useUpdateCall } from '../hooks/useCallQueries';
import { useAllReferenceData } from '../hooks/useReferenceQueries';
import { UpdateCallRequest } from '../types/api.types';
import './EditCall.css';

interface EditCallFormData {
  isInbound: string;
  taskId: string;
  subjectId: string;
  isAgent: string;
  comments: string;
  startTime: string;
  endTime: string;
}

export const EditCall: React.FC = () => {
  const navigate = useNavigate();
  const { callId } = useParams<{ callId: string }>();
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: call, isLoading, error } = useCall(callId || '');
  const { tasks, subjects } = useAllReferenceData();
  const updateCallMutation = useUpdateCall();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<EditCallFormData>();

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

  // Initialize form with call data
  useEffect(() => {
    if (call) {
      setValue('isInbound', call.isInbound ? 'yes' : 'no');
      setValue('isAgent', call.isAgent ? 'yes' : 'no');
      setValue('comments', call.comments || '');
      setValue('startTime', formatDateTimeForInput(call.startTime));
      
      // Set end time - if call has endTime, use it, otherwise calculate from start + duration
      if (call.endTime) {
        setValue('endTime', formatDateTimeForInput(call.endTime));
      } else if (call.durationMinutes) {
        const startTime = new Date(call.startTime);
        const endTime = new Date(startTime.getTime() + call.durationMinutes * 60000);
        setValue('endTime', formatDateTimeForInput(endTime.toISOString()));
      }
      
      // Find the matching reference data IDs for Task-Subject model
      const matchingTask = tasks.data?.find(task => task.name === call.taskName);
      if (matchingTask) {
        setValue('taskId', matchingTask.id);
      }
      
      const matchingSubject = subjects.data?.find(subj => subj.name === call.subjectName);
      if (matchingSubject) {
        setValue('subjectId', matchingSubject.id);
      }
    }
  }, [call, setValue, tasks.data, subjects.data]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTimeForInput = (dateString: string): string => {
    // Convert ISO string to local datetime-local input format
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (data: EditCallFormData) => {
    if (!call) return;

    try {
      const updateData: UpdateCallRequest = {
        isInbound: data.isInbound === 'yes',
        isAgent: data.isAgent === 'yes',
        comments: data.comments || undefined,
      };

      // Add times - convert to ISO string format
      if (data.startTime) {
        updateData.startTime = new Date(data.startTime).toISOString();
      }
      if (data.endTime) {
        updateData.endTime = new Date(data.endTime).toISOString();
      }

      // Add IDs only if selected
      if (data.taskId) {
        updateData.taskId = data.taskId;
      }
      if (data.subjectId) {
        updateData.subjectId = data.subjectId;
      }

      await updateCallMutation.mutateAsync({
        callId: call.id,
        request: updateData,
      });
      
      // Navigate back to history with success message
      navigate('/history', { 
        state: { message: 'Call updated successfully' }
      });
    } catch (error) {
      console.error('Failed to update call:', error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/history');
      }
    } else {
      navigate('/history');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading call details...</div>;
  }

  if (error || !call) {
    return (
      <div className="error-state">
        <h3>Call Not Found</h3>
        <p>The call you're trying to edit could not be found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/history')}>
          Back to History
        </button>
      </div>
    );
  }

  // Task-Subject model: Get selected task and check if it has subjects
  const selectedTask = selectedTaskId && tasks.data ? 
    tasks.data.find(t => t.id === selectedTaskId) : null;
  const selectedTaskHasSubjects = selectedTask?.hasSubjects || false;
  const availableSubjects = selectedTask?.subjects || [];

  return (
    <div className="edit-call-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Edit Call</h2>
          <p className="subtitle">Modify call details and information</p>
        </div>
        <div className="call-info">
          <div className="info-item">
            <span>Date: {formatDate(call.startTime)}</span>
          </div>
          <div className="info-item">
            <span>Time: {formatTime(call.startTime)}</span>
          </div>
          <div className="info-item">
            <span>Duration: {formatDuration(call.durationMinutes)}</span>
          </div>
        </div>
      </div>

      <div className="edit-call-container">
        <form onSubmit={handleSubmit(onSubmit)} className="call-form">
          <div className="form-section">
            <h3>Call Timing</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  {...register('startTime', {
                    required: 'Start time is required',
                  })}
                  className={errors.startTime ? 'error' : ''}
                />
                {errors.startTime && (
                  <span className="error-message">{errors.startTime.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  {...register('endTime', {
                    required: 'End time is required',
                    validate: (value) => {
                      const startTime = watch('startTime');
                      if (startTime && value && new Date(value) <= new Date(startTime)) {
                        return 'End time must be after start time';
                      }
                      return true;
                    }
                  })}
                  className={errors.endTime ? 'error' : ''}
                />
                {errors.endTime && (
                  <span className="error-message">{errors.endTime.message}</span>
                )}
              </div>
            </div>
          </div>

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
                      {...register('isInbound')}
                    />
                    <span className="toggle-label">Inbound</span>
                  </label>
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="no"
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
                      {...register('isAgent')}
                    />
                    <span className="toggle-label">No</span>
                  </label>
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="yes"
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
                <label>Task</label>
                <select {...register('taskId')}>
                  <option value="">Select Task</option>
                  {tasks.data?.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ visibility: selectedTaskHasSubjects ? 'visible' : 'hidden' }}>
                <label>Subject</label>
                <select {...register('subjectId')} disabled={!selectedTaskHasSubjects}>
                  <option value="">Select Subject</option>
                  {availableSubjects.map((subject) => (
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
            
            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={updateCallMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isDirty || updateCallMutation.isPending}
              >
                {updateCallMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        <div className="call-sidebar">
          <div className="sidebar-card call-summary">
            <h4>Call Summary</h4>
            <div className="summary-item">
              <span>Datatech:</span>
              <span>{call.datatechName}</span>
            </div>
            <div className="summary-item">
              <span>Email:</span>
              <span>{call.datatechEmail}</span>
            </div>
            <div className="summary-item">
              <span>Started:</span>
              <span>{formatTime(call.startTime)}</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>{formatDuration(call.durationMinutes)}</span>
            </div>
            <div className="summary-item">
              <span>Status:</span>
              <span>{call.completed ? 'Completed' : call.inProgress ? 'In Progress' : 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};