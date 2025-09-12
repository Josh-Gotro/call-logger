import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useFilteredCalls } from '../hooks/useCallQueries';
import { useAllReferenceData } from '../hooks/useReferenceQueries';
import { CallEntry } from '../types/api.types';
import './CallHistory.css';

interface CallFilters {
  startDate: string;
  endDate: string;
  taskId: string;
  subjectId: string;
  status: 'all' | 'completed' | 'in-progress';
}

export const CallHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('startTime,desc');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<{ id: string; text: string; x: number; y: number } | null>(null);
  const [filters, setFilters] = useState<CallFilters>({
    startDate: '',
    endDate: '',
    taskId: '',
    subjectId: '',
    status: 'all',
  });

  const { tasks, subjects } = useAllReferenceData();

  // Prepare filter parameters for API call
  const apiFilters = useMemo(() => {
    const result: any = {
      userEmail: user?.email,
      page: currentPage,
      size: pageSize,
      sort: sortBy,
    };

    if (filters.startDate) result.startDate = filters.startDate + 'T00:00:00Z';
    if (filters.endDate) result.endDate = filters.endDate + 'T23:59:59Z';
    if (filters.taskId) result.taskId = filters.taskId;
    if (filters.subjectId) result.subjectId = filters.subjectId;

    return result;
  }, [user?.email, currentPage, pageSize, sortBy, filters]);

  const { data: callsData, isLoading, error } = useFilteredCalls(apiFilters);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (call: CallEntry): string => {
    if (!call.startTime || !call.endTime) {
      return call.durationMinutes < 60 ? `${call.durationMinutes}m` :
             `${Math.floor(call.durationMinutes / 60)}h ${call.durationMinutes % 60}m`;
    }

    const start = new Date(call.startTime);
    const end = new Date(call.endTime);
    const totalSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleFilterChange = (field: keyof CallFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      taskId: '',
      subjectId: '',
      status: 'all',
    });
    setCurrentPage(0);
  };

  const getStatusBadge = (call: CallEntry) => {
    if (call.inProgress) {
      return <span className="status-badge in-progress">In Progress</span>;
    }
    if (call.completed) {
      return <span className="status-badge completed">Completed</span>;
    }
    return <span className="status-badge unknown">Unknown</span>;
  };

  // Filter calls based on status filter (client-side filtering)
  const filteredCalls = useMemo(() => {
    if (!callsData?.content) return [];

    return callsData.content.filter(call => {
      if (filters.status === 'completed') return call.completed;
      if (filters.status === 'in-progress') return call.inProgress;
      return true; // 'all'
    });
  }, [callsData?.content, filters.status]);

  if (error) {
    return (
      <div className="error-state">
        <h3>Error Loading Calls</h3>
        <p>There was an error loading your call history. Please try again.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {hoveredComment && (
        <div
          className="comment-tooltip"
          style={{
            left: hoveredComment.x,
            top: hoveredComment.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {hoveredComment.text}
        </div>
      )}
      <div className="call-history-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Call History</h2>
          <p className="subtitle">View and manage your call records</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/start-call')}
          >
            📞 New Call
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                title="Start Date"
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                title="End Date"
              />
            </div>
            <div className="filter-group">
              <label>Task</label>
              <select
                value={filters.taskId}
                onChange={(e) => handleFilterChange('taskId', e.target.value)}
                title="Task"
              >
                <option value="">All Tasks</option>
                {tasks.data?.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Subject</label>
              <select
                value={filters.subjectId}
                onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                title="Subject"
              >
                <option value="">All Subjects</option>
                {subjects.data?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as any)}
                title="Status"
              >
                <option value="all">All Calls</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="calls-container">
        <div className="calls-toolbar">
          <div className="results-info">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>
                Showing {callsData?.content?.length ? (currentPage * pageSize + 1) : 0}-{Math.min((currentPage + 1) * pageSize, callsData?.totalElements || 0)} of {callsData?.totalElements || 0} calls
              </span>
            )}
          </div>
          <div className="toolbar-controls">
            <select
              aria-label="Page size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="page-size-select"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
              aria-label="Sort by"
            >
              <option value="startTime,desc">Newest First</option>
              <option value="startTime,asc">Oldest First</option>
              <option value="durationMinutes,desc">Longest Duration</option>
              <option value="durationMinutes,asc">Shortest Duration</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your call history...</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="empty-state">
            <h3>No Calls Found</h3>
            <p>
              {Object.values(filters).some(v => v)
                ? 'No calls match your current filters.'
                : "You haven't made any calls yet."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="calls-header">
              <div className="header-type">Type</div>
              <div className="header-date">Date/Start Time</div>
              <div className="header-duration">Duration</div>
              <div className="header-agent">Agent</div>
              <div className="header-status">Status</div>
              <div className="header-comments">Comments</div>
            </div>
            <div className="calls-list">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className="call-item clickable"
                  onClick={() => navigate(`/edit-call/${call.id}`)}
                >
                  <div className="call-type">
                    {call.isInbound ? '📞 Inbound' : '📱 Outbound'}
                  </div>

                  <div className="call-date">
                    <div className="date-text">{formatDate(call.startTime)}</div>
                    <div className="time-text">{formatTime(call.startTime)}</div>
                  </div>

                  <div className="call-duration">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{formatDuration(call)}</span>
                  </div>

                  <div className="call-agent">
                    {call.isAgent && <span className="agent-indicator">👤 Agent</span>}
                  </div>

                  <div className="call-status">
                    {getStatusBadge(call)}
                  </div>

                  <div
                    className="call-comments"
                    onMouseEnter={(e) => {
                      if (call.comments) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredComment({
                          id: call.id,
                          text: call.comments,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredComment(null)}
                  >
                    {call.comments && <span className="comments-text">{call.comments}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {callsData && callsData.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage + 1} of {callsData.totalPages}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= callsData.totalPages - 1}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};