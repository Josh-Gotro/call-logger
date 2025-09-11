import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCall, useUpdateCall } from '../hooks/useCallQueries';
import { useAllReferenceData } from '../hooks/useReferenceQueries';
import { UpdateCallRequest } from '../types/api.types';
import './EditCall.css';

interface EditCallFormData {
  isInbound: string;
  programManagementParentId: string;
  programManagementChildId: string;
  categoryId: string;
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
  const { programManagement, categories, subjects } = useAllReferenceData();
  const updateCallMutation = useUpdateCall();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<EditCallFormData>();

  const selectedParentId = watch('programManagementParentId');
  
  // Clear child selection when parent changes or has no children
  useEffect(() => {
    const selectedParent = programManagement.data?.find(p => p.id === selectedParentId);
    const hasChildren = selectedParent?.children && selectedParent.children.length > 0;
    
    if (!hasChildren) {
      setValue('programManagementChildId', '');
    }
  }, [selectedParentId, programManagement.data, setValue]);

  // Initialize form with call data
  useEffect(() => {
    if (call) {
      setValue('isInbound', call.isInbound || 'no');
      setValue('isAgent', call.isAgent || 'no');
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
      
      // Find the matching reference data IDs
      const matchingCategory = categories.data?.find(cat => cat.name === call.category);
      if (matchingCategory) {
        setValue('categoryId', matchingCategory.id);
      }
      
      const matchingSubject = subjects.data?.find(subj => subj.name === call.subject);
      if (matchingSubject) {
        setValue('subjectId', matchingSubject.id);
      }
      
      // For program management, we need to find parent and child
      if (call.programManagement) {
        programManagement.data?.forEach(parent => {
          const matchingChild = parent.children?.find(child => 
            `${parent.name} - ${child.name}` === call.programManagement
          );
          if (matchingChild) {
            setValue('programManagementParentId', parent.id);
            setValue('programManagementChildId', matchingChild.id);
          }
        });
      }
    }
  }, [call, setValue, categories.data, subjects.data, programManagement.data]);

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

  // Get children for selected parent
  const selectedParent = programManagement.data?.find(p => p.id === selectedParentId);
  const availableChildren = selectedParent?.children || [];

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
            <h3>Program Management</h3>
            
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
                  {...register('programManagementChildId')}
                  disabled={!selectedParentId || availableChildren.length === 0}
                >
                  <option value="">Select Sub-Department</option>
                  {availableChildren.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
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