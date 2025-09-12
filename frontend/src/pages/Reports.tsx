import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { useTasks, useSubjects } from '../hooks/useReferenceQueries';
import './Reports.css';

interface ReportFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
  datatechEmail?: string;
  taskId?: string;
  subjectId?: string;
  isInbound?: boolean | null;
  isAgent?: boolean | null;
}

interface CallEntry {
  id: string;
  datatechName: string;
  datatechEmail: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isInbound: boolean;
  isAgent: boolean;
  taskName: string;
  subjectName: string;
  comments?: string;
}

interface ReportSummary {
  totalCalls: number;
  completedCalls: number;
  inProgressCalls: number;
  averageDurationMinutes: number;
  taskBreakdown: Record<string, number>;
  subjectBreakdown: Record<string, number>;
}

interface LiveReportResult {
  calls: CallEntry[];
  summary: ReportSummary;
  parameters: Record<string, any>;
}

interface PeriodOption {
  key: string;
  label: string;
  description: string;
}

interface ReferenceData {
  id: string;
  name: string;
  children?: ReferenceData[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export const Reports: React.FC = () => {
  const { user } = useUser();
  const [filters, setFilters] = useState<ReportFilters>({ period: 'THIS_MONTH' });
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  // Use new Task-Subject hooks instead of direct API calls
  const { data: tasks = [] } = useTasks();
  const { data: subjects = [] } = useSubjects();

  // Fetch available periods
  const { data: periods = [] } = useQuery<PeriodOption[]>({
    queryKey: ['report-periods'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/reports/periods`);
      if (!response.ok) throw new Error('Failed to fetch periods');
      return response.json();
    }
  });

  // Fetch reference data for filters
  // Convert new data format to legacy format for compatibility
  const programManagement = tasks.map(task => ({
    id: task.id,
    name: task.name,
    children: [],
    hasChildren: false
  }));

  const categories = subjects.map(subject => ({
    id: subject.id,
    name: subject.name
  }));

  // Fetch datatech users
  const { data: datatechUsers = [] } = useQuery<string[]>({
    queryKey: ['datatech-users'],
    queryFn: async () => {
      // For now, return the known users - in a real app this would be an API call
      return [
        'josh.gauthreaux@wostmann.com',
        'asimov@wostmann.com',
        'seldon@wostmann.com',
        'mule@wostmann.com'
      ];
    }
  });

  // Build query based on filters
  const buildReportQuery = () => {
    if (isCustomDateRange && filters.startDate && filters.endDate) {
      const params = new URLSearchParams();
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
      if (filters.datatechEmail) params.append('datatechEmail', filters.datatechEmail);
      if (filters.taskId) params.append('programParentId', filters.taskId);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.isInbound !== null && filters.isInbound !== undefined) params.append('isInbound', filters.isInbound.toString());
      if (filters.isAgent !== null && filters.isAgent !== undefined) params.append('isAgent', filters.isAgent.toString());
      params.append('requestedBy', user?.email || 'josh.gauthreaux@wostmann.com');
      return `daterange?${params.toString()}`;
    } else if (filters.period) {
      const params = new URLSearchParams();
      if (filters.datatechEmail) params.append('datatechEmail', filters.datatechEmail);
      if (filters.taskId) params.append('programParentId', filters.taskId);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.isInbound !== null && filters.isInbound !== undefined) params.append('isInbound', filters.isInbound.toString());
      if (filters.isAgent !== null && filters.isAgent !== undefined) params.append('isAgent', filters.isAgent.toString());
      params.append('requestedBy', user?.email || 'josh.gauthreaux@wostmann.com');
      return `period/${filters.period}?${params.toString()}`;
    }
    return null;
  };

  // Fetch report data
  const { data: reportData, isLoading, error, refetch } = useQuery<LiveReportResult>({
    queryKey: ['report', filters],
    queryFn: async () => {
      const query = buildReportQuery();
      if (!query) throw new Error('Invalid query parameters');

      const response = await fetch(`${API_BASE}/reports/${query}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json();
    },
    enabled: !!(filters.period || (isCustomDateRange && filters.startDate && filters.endDate))
  });

  // Export CSV
  const exportCSV = async () => {
    if (!reportData?.calls?.length) {
      alert('No data to export');
      return;
    }

    try {
      const query = buildReportQuery();
      if (!query) {
        alert('Please select a valid date range or period');
        return;
      }

      const url = query.startsWith('period/')
        ? `${API_BASE}/reports/export/csv/${filters.period}?${query.split('?')[1] || ''}`
        : `${API_BASE}/reports/export/csv/daterange?${query.split('?')[1] || ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to export CSV');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV');
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    let processedValue = value === '' ? undefined : value;
    
    // Convert string boolean values to actual booleans for isAgent and isInbound
    if ((key === 'isAgent' || key === 'isInbound') && processedValue !== undefined) {
      processedValue = processedValue === 'true' ? true : processedValue === 'false' ? false : processedValue;
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  const clearFilters = () => {
    setFilters({ period: 'THIS_MONTH' });
    setIsCustomDateRange(false);
  };

  const selectedTask = tasks.find(t => t.id === filters.taskId);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports</h1>
        <div className="reports-actions">
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={exportCSV}
            disabled={isLoading || !reportData?.calls.length}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="btn btn-link" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        <div className="filters-grid">
          {/* Time Period Selection */}
          <div className="filter-section">
            <h4>Time Period</h4>
            <div className="period-toggle">
              <button
                className={`toggle-btn ${!isCustomDateRange ? 'active' : ''}`}
                onClick={() => setIsCustomDateRange(false)}
              >
                Preset Periods
              </button>
              <button
                className={`toggle-btn ${isCustomDateRange ? 'active' : ''}`}
                onClick={() => setIsCustomDateRange(true)}
              >
                Custom Range
              </button>
            </div>

            {!isCustomDateRange ? (
              <select
                value={filters.period || ''}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="form-input"
                title="Select a preset time period"
              >
                <option value="">Select Period</option>
                {periods.map(period => (
                  <option key={period.key} value={period.key}>
                    {period.label} - {period.description}
                  </option>
                ))}
              </select>
            ) : (
              <div className="date-range-inputs">
                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="form-input"
                    placeholder="Start date"
                    title="Start date"
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="form-input"
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
          </div>

          {/* User Filter */}
          <div className="filter-group">
            <label htmlFor="datatech-select">Data Tech</label>
            <select
              id="datatech-select"
              value={filters.datatechEmail || ''}
              onChange={(e) => handleFilterChange('datatechEmail', e.target.value)}
              className="form-input"
            >
              <option value="">All Users</option>
              {datatechUsers.map(email => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="filter-group">
            <label>Task</label>
            <label htmlFor="department-select">Task</label>
            <select
              id="department-select"
              value={filters.taskId || ''}
              onChange={(e) => handleFilterChange('taskId', e.target.value)}
              className="form-input"
            >
              <option value="">All Tasks</option>
              {programManagement.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note: Sub-tasks not supported in Task-Subject model */}

          {/* Category Filter */}
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.subjectId || ''}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="form-input"
              title="Select a category"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="filter-group">
            <label>Subject</label>
            <select
              value={filters.subjectId || ''}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="form-input"
              title="Select a subject"
            >
              <option value="">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Call Type Filter */}
          <div className="filter-group">
            <label>Call Direction</label>
            <select
              value={filters.isInbound === null || filters.isInbound === undefined ? '' : filters.isInbound.toString()}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                handleFilterChange('isInbound', value);
              }}
              className="form-input"
              title="Select call direction"
            >
              <option value="">All Calls</option>
              <option value="true">Inbound Only</option>
              <option value="false">Outbound Only</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div className="filter-group">
            <label>Agent Status</label>
            <select
              value={filters.isAgent === null || filters.isAgent === undefined ? '' : filters.isAgent.toString()}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                handleFilterChange('isAgent', value);
              }}
              className="form-input"
              title="Filter by agent status"
            >
              <option value="">All Calls</option>
              <option value="true">Agent Calls Only</option>
              <option value="false">Non-Agent Calls Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {isLoading ? (
        <div className="loading-container">
          {/* <LoadingSpinner /> */}
        </div>
      ) : error ? (
        <Card className="error-card">
          <div className="error-message">
            <h3>Error Loading Report</h3>
            <p>{(error as Error).message}</p>
            <button className="btn btn-primary" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Statistics */}
          <Card className="summary-card">
            <h3>Summary Statistics</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Calls</span>
                <span className="summary-value">{reportData.summary.totalCalls}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Completed</span>
                <span className="summary-value">{reportData.summary.completedCalls}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">In Progress</span>
                <span className="summary-value">{reportData.summary.inProgressCalls}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Avg Duration</span>
                <span className="summary-value">
                  {reportData.summary.averageDurationMinutes.toFixed(1)}m
                </span>
              </div>
            </div>
          </Card>

          {/* Breakdown Charts */}
          {reportData?.summary && (Object.keys(reportData.summary.taskBreakdown || {}).length > 0 ||
            Object.keys(reportData.summary.subjectBreakdown || {}).length > 0) && (
            <div className="breakdown-section">
              {Object.keys(reportData.summary.subjectBreakdown || {}).length > 0 && (
                <Card className="breakdown-card">
                  <h4>By Subject</h4>
                  <div className="breakdown-list">
                    {Object.entries(reportData.summary.subjectBreakdown || {})
                      .sort(([,a], [,b]) => b - a)
                      .map(([subject, count]) => (
                      <div key={subject} className="breakdown-item">
                        <span className="breakdown-label">{subject}</span>
                        <span className="breakdown-value">{count}</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(count / reportData.summary.totalCalls) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {Object.keys(reportData.summary.taskBreakdown || {}).length > 0 && (
                <Card className="breakdown-card">
                  <h4>By Task</h4>
                  <div className="breakdown-list">
                    {Object.entries(reportData.summary.taskBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([task, count]) => (
                      <div key={task} className="breakdown-item">
                        <span className="breakdown-label">{task}</span>
                        <span className="breakdown-value">{count}</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(count / reportData.summary.totalCalls) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Call Details Table */}
          <Card className="table-card">
            <div className="table-header">
              <h3>Call Details ({reportData.calls.length} records)</h3>
            </div>

            {reportData.calls.length > 0 ? (
              <div className="table-container">
                <table className="calls-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Data Tech</th>
                      <th>Duration</th>
                      <th>Type</th>
                      <th>Task</th>
                      <th>Subject</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.calls.map((call) => (
                      <tr key={call.id}>
                        <td>
                          <div className="date-time">
                            <div>{format(new Date(call.startTime), 'MMM dd, yyyy')}</div>
                            <div className="time">
                              {format(new Date(call.startTime), 'HH:mm')} - {format(new Date(call.endTime), 'HH:mm')}
                            </div>
                          </div>
                        </td>
                        <td>{call.datatechName}</td>
                        <td>{call.durationMinutes}m</td>
                        <td>
                          <span className={`call-type ${call.isInbound ? 'inbound' : 'outbound'}`}>
                            {call.isInbound ? 'Inbound' : 'Outbound'}
                            {call.isAgent && ' (Agent)'}
                          </span>
                        </td>
                        <td>{call.taskName || '-'}</td>
                        <td>{call.subjectName || '-'}</td>
                        <td className="comments-cell">
                          {call.comments ? (
                            <span title={call.comments}>
                              {call.comments.length > 50
                                ? `${call.comments.substring(0, 50)}...`
                                : call.comments
                              }
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No calls found for the selected criteria.</p>
                <p>Try adjusting your filters or selecting a different time period.</p>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="welcome-card">
          <h3>Welcome to Reports</h3>
          <p>Select a time period and apply any filters to generate your report.</p>
        </Card>
      )}
    </div>
  );
};