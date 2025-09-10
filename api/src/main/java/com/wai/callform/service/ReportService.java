package com.wai.callform.service;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.ReportRequest;
import com.wai.callform.dto.ReportRunDto;
import com.wai.callform.entity.CallEntry;
import com.wai.callform.entity.ReportRun;
import com.wai.callform.repository.CallEntryRepository;
import com.wai.callform.repository.ReportRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRunRepository reportRunRepository;
    private final CallEntryRepository callEntryRepository;
    private final CallEntryService callEntryService;

    /**
     * Generate a live report (immediate response)
     */
    public LiveReportResult generateLiveReport(ReportRequest request) {
        log.info("Generating live report for user: {} with type: {}", 
                request.getRequestedBy(), request.getReportType());

        // Create parameters map for filtering
        Map<String, Object> parameters = buildParametersMap(request);
        
        // Execute the query based on report type
        List<CallEntryDto> calls = switch (request.getReportType()) {
            case "LIVE" -> {
                if (request.getUserEmail() != null) {
                    // TODO: Update to handle UUID conversion for program management and category
                    yield callEntryService.getCallsWithFilters(
                        request.getUserEmail(),
                        null, // request.getProgramManagement(), // TODO: Convert string to UUID
                        null, // request.getCategory(), // TODO: Convert string to UUID
                        request.getStartDate(),
                        request.getEndDate(),
                        Pageable.unpaged()
                    ).getContent();
                } else {
                    yield callEntryService.getCallsByDateRange(
                        request.getStartDate() != null ? request.getStartDate() : OffsetDateTime.now().minusDays(30),
                        request.getEndDate() != null ? request.getEndDate() : OffsetDateTime.now()
                    );
                }
            }
            default -> throw new IllegalArgumentException("Unsupported live report type: " + request.getReportType());
        };

        // Generate summary statistics
        ReportSummary summary = generateReportSummary(calls);
        
        return new LiveReportResult(calls, summary, parameters);
    }

    /**
     * Queue an async report for background processing
     */
    @Transactional
    public ReportRunDto queueAsyncReport(ReportRequest request) {
        log.info("Queueing async report for user: {} with type: {}", 
                request.getRequestedBy(), request.getReportType());

        ReportRun reportRun = new ReportRun();
        reportRun.setRequestedBy(request.getRequestedBy());
        reportRun.setStatus(ReportRun.ReportStatus.PENDING);
        reportRun.setReportType(ReportRun.ReportType.valueOf(request.getReportType()));
        reportRun.setParameters(buildParametersMap(request));

        ReportRun savedReport = reportRunRepository.save(reportRun);
        log.info("Queued async report with ID: {}", savedReport.getId());

        // TODO: In a real implementation, this would trigger background processing
        // For now, we'll simulate async processing
        
        return mapReportToDto(savedReport);
    }

    /**
     * Get report run status
     */
    public ReportRunDto getReportStatus(UUID reportId) {
        ReportRun reportRun = reportRunRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        return mapReportToDto(reportRun);
    }

    /**
     * Get user's report history
     */
    public Page<ReportRunDto> getUserReports(String userEmail, Pageable pageable) {
        return reportRunRepository.findByRequestedByOrderByCreatedAtDesc(userEmail, pageable)
            .map(this::mapReportToDto);
    }

    /**
     * Get completed reports with results
     */
    public List<ReportRunDto> getUserCompletedReports(String userEmail) {
        return reportRunRepository.findUserCompletedReportsWithResults(userEmail)
            .stream()
            .map(this::mapReportToDto)
            .toList();
    }

    /**
     * Simulate processing a pending report (for development/testing)
     */
    @Transactional
    public ReportRunDto processReport(UUID reportId) {
        log.info("Processing report ID: {}", reportId);
        
        ReportRun reportRun = reportRunRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        if (reportRun.getStatus() != ReportRun.ReportStatus.PENDING) {
            throw new IllegalStateException("Report is not in pending status");
        }

        try {
            // Mark as started
            reportRun.markAsStarted();
            reportRunRepository.save(reportRun);

            // Simulate processing time
            Thread.sleep(1000);

            // Generate the actual report data
            Map<String, Object> params = reportRun.getParameters();
            String reportData = generateReportContent(params);
            
            // In a real implementation, this would save to file storage and return URL
            String resultUrl = "/api/reports/" + reportId + "/download";
            
            reportRun.markAsCompleted(resultUrl);
            ReportRun savedReport = reportRunRepository.save(reportRun);
            
            log.info("Completed processing report ID: {}", reportId);
            return mapReportToDto(savedReport);
            
        } catch (Exception e) {
            log.error("Failed to process report ID: {}", reportId, e);
            reportRun.markAsFailed(e.getMessage());
            reportRunRepository.save(reportRun);
            return mapReportToDto(reportRun);
        }
    }

    /**
     * Get report statistics for admin dashboard
     */
    public ReportStatistics getReportStatistics() {
        List<Object[]> statusCounts = reportRunRepository.getReportStatusCounts();
        Map<String, Long> statusMap = statusCounts.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));

        return new ReportStatistics(
            statusMap.getOrDefault("PENDING", 0L),
            statusMap.getOrDefault("RUNNING", 0L),
            statusMap.getOrDefault("COMPLETED", 0L),
            statusMap.getOrDefault("FAILED", 0L)
        );
    }

    /**
     * Build parameters map from request
     */
    private Map<String, Object> buildParametersMap(ReportRequest request) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("reportType", request.getReportType());
        parameters.put("requestedBy", request.getRequestedBy());
        
        if (request.getStartDate() != null) {
            parameters.put("startDate", request.getStartDate().toString());
        }
        if (request.getEndDate() != null) {
            parameters.put("endDate", request.getEndDate().toString());
        }
        if (request.getUserEmail() != null) {
            parameters.put("userEmail", request.getUserEmail());
        }
        if (request.getProgramManagement() != null) {
            parameters.put("programManagement", request.getProgramManagement());
        }
        if (request.getCategory() != null) {
            parameters.put("category", request.getCategory());
        }
        if (request.getSubject() != null) {
            parameters.put("subject", request.getSubject());
        }
        
        if (request.getAdditionalFilters() != null) {
            parameters.putAll(request.getAdditionalFilters());
        }
        
        return parameters;
    }

    /**
     * Generate report summary statistics
     */
    private ReportSummary generateReportSummary(List<CallEntryDto> calls) {
        long totalCalls = calls.size();
        long completedCalls = calls.stream().filter(CallEntryDto::isCompleted).count();
        long inProgressCalls = calls.stream().filter(CallEntryDto::isInProgress).count();
        
        double avgDuration = calls.stream()
            .filter(CallEntryDto::isCompleted)
            .mapToLong(call -> call.getDurationMinutes() != null ? call.getDurationMinutes() : 0)
            .average()
            .orElse(0.0);
        
        // Group by categories
        Map<String, Long> categoryBreakdown = calls.stream()
            .filter(call -> call.getCategory() != null)
            .collect(Collectors.groupingBy(CallEntryDto::getCategory, Collectors.counting()));
        
        Map<String, Long> programBreakdown = calls.stream()
            .filter(call -> call.getProgramManagement() != null)
            .collect(Collectors.groupingBy(CallEntryDto::getProgramManagement, Collectors.counting()));

        return new ReportSummary(totalCalls, completedCalls, inProgressCalls, avgDuration, 
                                categoryBreakdown, programBreakdown);
    }

    /**
     * Generate report content (placeholder implementation)
     */
    private String generateReportContent(Map<String, Object> parameters) {
        // In a real implementation, this would generate CSV, Excel, or PDF content
        return "Report generated with parameters: " + parameters.toString();
    }

    /**
     * Map ReportRun entity to DTO
     */
    private ReportRunDto mapReportToDto(ReportRun entity) {
        ReportRunDto dto = new ReportRunDto();
        dto.setId(entity.getId());
        dto.setRequestedBy(entity.getRequestedBy());
        dto.setStatus(entity.getStatus().name());
        dto.setReportType(entity.getReportType().name());
        dto.setParameters(entity.getParameters());
        dto.setResultUrl(entity.getResultUrl());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setStartedAt(entity.getStartedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        
        // Set computed fields
        dto.setInProgress(entity.isInProgress());
        dto.setCompleted(entity.isCompleted());
        dto.setFailed(entity.isFailed());
        dto.setProcessingTimeMinutes(entity.getProcessingTimeMinutes());
        
        return dto;
    }

    // Result DTOs
    public record LiveReportResult(
        List<CallEntryDto> calls,
        ReportSummary summary,
        Map<String, Object> parameters
    ) {}

    public record ReportSummary(
        long totalCalls,
        long completedCalls,
        long inProgressCalls,
        double averageDurationMinutes,
        Map<String, Long> categoryBreakdown,
        Map<String, Long> programBreakdown
    ) {}

    public record ReportStatistics(
        long pendingReports,
        long runningReports,
        long completedReports,
        long failedReports
    ) {}
}