package com.wai.callform.repository;

import com.wai.callform.entity.ReportRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRunRepository extends JpaRepository<ReportRun, UUID> {

    // Find reports by user
    List<ReportRun> findByRequestedByOrderByCreatedAtDesc(String requestedBy);

    // Find reports by user with pagination
    Page<ReportRun> findByRequestedByOrderByCreatedAtDesc(String requestedBy, Pageable pageable);

    // Find reports by status
    List<ReportRun> findByStatusOrderByCreatedAtDesc(ReportRun.ReportStatus status);

    // Find reports by type
    List<ReportRun> findByReportTypeOrderByCreatedAtDesc(ReportRun.ReportType reportType);

    // Find pending reports (for processing queue)
    @Query("SELECT r FROM ReportRun r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<ReportRun> findPendingReportsForProcessing();

    // Find running reports (for monitoring)
    @Query("SELECT r FROM ReportRun r WHERE r.status = 'RUNNING' ORDER BY r.startedAt ASC")
    List<ReportRun> findRunningReports();

    // Find reports that have been running too long (stuck reports)
    @Query("SELECT r FROM ReportRun r WHERE r.status = 'RUNNING' AND r.startedAt < :cutoffTime")
    List<ReportRun> findStuckReports(@Param("cutoffTime") OffsetDateTime cutoffTime);

    // Find reports by user and status
    List<ReportRun> findByRequestedByAndStatusOrderByCreatedAtDesc(String requestedBy, 
                                                                  ReportRun.ReportStatus status);

    // Find completed reports with results available
    @Query("SELECT r FROM ReportRun r WHERE r.status = 'COMPLETED' AND r.resultUrl IS NOT NULL ORDER BY r.completedAt DESC")
    List<ReportRun> findCompletedReportsWithResults();

    // Find user's completed reports with results
    @Query("SELECT r FROM ReportRun r WHERE r.requestedBy = :user AND r.status = 'COMPLETED' AND r.resultUrl IS NOT NULL ORDER BY r.completedAt DESC")
    List<ReportRun> findUserCompletedReportsWithResults(@Param("user") String requestedBy);

    // Find reports within date range
    @Query("SELECT r FROM ReportRun r WHERE r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<ReportRun> findByDateRange(@Param("startDate") OffsetDateTime startDate,
                                   @Param("endDate") OffsetDateTime endDate);

    // Find reports by user within date range
    @Query("SELECT r FROM ReportRun r WHERE r.requestedBy = :user AND r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<ReportRun> findByUserAndDateRange(@Param("user") String requestedBy,
                                          @Param("startDate") OffsetDateTime startDate,
                                          @Param("endDate") OffsetDateTime endDate);

    // Count reports by status
    long countByStatus(ReportRun.ReportStatus status);

    // Count reports by user
    long countByRequestedBy(String requestedBy);

    // Count reports by user and status
    long countByRequestedByAndStatus(String requestedBy, ReportRun.ReportStatus status);

    // Find recent reports for dashboard (last 30 days)
    @Query("SELECT r FROM ReportRun r WHERE r.createdAt >= :cutoffDate ORDER BY r.createdAt DESC")
    List<ReportRun> findRecentReports(@Param("cutoffDate") OffsetDateTime cutoffDate, Pageable pageable);

    // Find reports that failed and might need retry
    @Query("SELECT r FROM ReportRun r WHERE r.status = 'FAILED' AND r.completedAt >= :cutoffDate ORDER BY r.completedAt DESC")
    List<ReportRun> findRecentFailedReports(@Param("cutoffDate") OffsetDateTime cutoffDate);

    // Clean up old completed reports (for maintenance)
    @Query("SELECT r FROM ReportRun r WHERE r.status IN ('COMPLETED', 'FAILED') AND r.completedAt < :cutoffDate")
    List<ReportRun> findOldReportsForCleanup(@Param("cutoffDate") OffsetDateTime cutoffDate);

    // TODO: Add performance monitoring query later - commenting out for now due to HQL syntax issues
    // Performance monitoring - average processing time by report type
    // @Query("SELECT r.reportType, AVG(FUNCTION('EXTRACT', 'EPOCH', (r.completedAt - r.startedAt))/60.0) as avgMinutes " +
    //        "FROM ReportRun r WHERE r.status = 'COMPLETED' AND r.startedAt IS NOT NULL AND r.completedAt IS NOT NULL " +
    //        "GROUP BY r.reportType")
    // List<Object[]> findAverageProcessingTimeByType();

    // Get report statistics for admin dashboard
    @Query("SELECT r.status, COUNT(r) FROM ReportRun r GROUP BY r.status")
    List<Object[]> getReportStatusCounts();
}