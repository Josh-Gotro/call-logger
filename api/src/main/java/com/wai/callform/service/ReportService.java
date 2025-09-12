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

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
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
                List<CallEntryDto> baseCalls;
                if (request.getUserEmail() != null) {
                    // TODO: Update to handle UUID conversion for program management and category
                    baseCalls = callEntryService.getCallsWithFilters(
                        request.getUserEmail(),
                        null, // request.getProgramManagement(), // TODO: Convert string to UUID
                        null, // request.getCategory(), // TODO: Convert string to UUID
                        request.getStartDate(),
                        request.getEndDate(),
                        Pageable.unpaged()
                    ).getContent();
                } else {
                    baseCalls = callEntryService.getCallsByDateRange(
                        request.getStartDate() != null ? request.getStartDate() : OffsetDateTime.now().minusDays(30),
                        request.getEndDate() != null ? request.getEndDate() : OffsetDateTime.now()
                    );
                }
                
                // Apply additional filters from the request
                yield applyAdditionalFilters(baseCalls, request.getAdditionalFilters());
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
        
        // Group by tasks (formerly categories)
        Map<String, Long> taskBreakdown = calls.stream()
            .filter(call -> call.getTaskName() != null)
            .collect(Collectors.groupingBy(CallEntryDto::getTaskName, Collectors.counting()));
        
        Map<String, Long> subjectBreakdown = calls.stream()
            .filter(call -> call.getSubjectName() != null)
            .collect(Collectors.groupingBy(CallEntryDto::getSubjectName, Collectors.counting()));

        return new ReportSummary(totalCalls, completedCalls, inProgressCalls, avgDuration, 
                                taskBreakdown, subjectBreakdown);
    }

    /**
     * Generate CSV report content
     */
    public String generateCsvReport(ReportRequest request) {
        log.info("Generating CSV report for user: {} with type: {}", 
                request.getRequestedBy(), request.getReportType());
        
        // Generate the live report data
        LiveReportResult reportData = generateLiveReport(request);
        
        StringBuilder csv = new StringBuilder();
        
        // CSV Headers
        csv.append("ID,DataTech Name,DataTech Email,Start Time,End Time,Duration (minutes),")
           .append("Program Management,Category,Subject,Is Inbound,Is Agent,Comments,Created At")
           .append("\n");
        
        // CSV Data Rows
        for (CallEntryDto call : reportData.calls()) {
            csv.append(escapeCSV(call.getId() != null ? call.getId().toString() : "")).append(",")
               .append(escapeCSV(call.getDatatechName() != null ? call.getDatatechName() : "")).append(",")
               .append(escapeCSV(call.getDatatechEmail() != null ? call.getDatatechEmail() : "")).append(",")
               .append(escapeCSV(call.getStartTime() != null ? call.getStartTime().toString() : "")).append(",")
               .append(escapeCSV(call.getEndTime() != null ? call.getEndTime().toString() : "")).append(",")
               .append(escapeCSV(call.getDurationMinutes() != null ? call.getDurationMinutes().toString() : "")).append(",")
               .append(escapeCSV(call.getTaskName() != null ? call.getTaskName() : "")).append(",")
               .append(escapeCSV(call.getSubjectName() != null ? call.getSubjectName() : "")).append(",")
               .append(escapeCSV(call.getTaskSubjectDisplay() != null ? call.getTaskSubjectDisplay() : "")).append(",")
               .append(escapeCSV(call.getIsInbound() != null ? call.getIsInbound().toString() : "")).append(",")
               .append(escapeCSV(call.getIsAgent() != null ? call.getIsAgent().toString() : "")).append(",")
               .append(escapeCSV(call.getComments() != null ? call.getComments() : "")).append(",")
               .append(escapeCSV(call.getCreatedAt() != null ? call.getCreatedAt().toString() : ""))
               .append("\n");
        }
        
        return csv.toString();
    }
    
    /**
     * Escape CSV values to handle commas, quotes, and newlines
     */
    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        
        // If the value contains comma, quote, or newline, wrap it in quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            // Escape existing quotes by doubling them
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        
        return value;
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

    /**
     * Build a report request for a specific time period
     */
    public ReportRequest buildPeriodRequest(String period, String requestedBy, String datatechEmail,
                                           String programManagementParentId, String programManagementChildId,
                                           String categoryId, String subjectId, Boolean isInbound, Boolean isAgent) {
        
        OffsetDateTime[] dateRange = calculatePeriodRange(period);
        
        ReportRequest request = new ReportRequest();
        request.setReportType("LIVE");
        request.setRequestedBy(requestedBy);
        request.setStartDate(dateRange[0]);
        request.setEndDate(dateRange[1]);
        request.setUserEmail(datatechEmail);
        request.setProgramManagement(programManagementParentId);
        request.setCategory(categoryId);
        request.setSubject(subjectId);
        
        // Add additional filters
        if (programManagementChildId != null || isInbound != null || isAgent != null) {
            Map<String, Object> additionalFilters = new HashMap<>();
            if (programManagementChildId != null) {
                additionalFilters.put("programManagementChildId", programManagementChildId);
            }
            if (isInbound != null) {
                additionalFilters.put("isInbound", isInbound);
            }
            if (isAgent != null) {
                additionalFilters.put("isAgent", isAgent);
            }
            request.setAdditionalFilters(additionalFilters);
        }
        
        return request;
    }
    
    /**
     * Calculate date range for predefined periods
     */
    private OffsetDateTime[] calculatePeriodRange(String period) {
        LocalDate today = LocalDate.now();
        ZoneId alaskaZone = ZoneId.of("America/Anchorage");
        
        return switch (period.toUpperCase()) {
            case "THIS_WEEK" -> {
                LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                yield new OffsetDateTime[]{
                    startOfWeek.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    today.plusDays(1).atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "LAST_WEEK" -> {
                LocalDate startOfLastWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).minusWeeks(1);
                LocalDate endOfLastWeek = startOfLastWeek.plusDays(7);
                yield new OffsetDateTime[]{
                    startOfLastWeek.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    endOfLastWeek.atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "THIS_MONTH" -> {
                LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
                yield new OffsetDateTime[]{
                    startOfMonth.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    today.plusDays(1).atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "LAST_MONTH" -> {
                LocalDate startOfLastMonth = today.with(TemporalAdjusters.firstDayOfMonth()).minusMonths(1);
                LocalDate endOfLastMonth = startOfLastMonth.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
                yield new OffsetDateTime[]{
                    startOfLastMonth.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    endOfLastMonth.atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "THIS_QUARTER" -> {
                int currentQuarter = (today.getMonthValue() - 1) / 3 + 1;
                LocalDate startOfQuarter = LocalDate.of(today.getYear(), (currentQuarter - 1) * 3 + 1, 1);
                yield new OffsetDateTime[]{
                    startOfQuarter.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    today.plusDays(1).atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "LAST_QUARTER" -> {
                int currentQuarter = (today.getMonthValue() - 1) / 3 + 1;
                int lastQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
                int year = currentQuarter == 1 ? today.getYear() - 1 : today.getYear();
                
                LocalDate startOfLastQuarter = LocalDate.of(year, (lastQuarter - 1) * 3 + 1, 1);
                LocalDate endOfLastQuarter = startOfLastQuarter.plusMonths(3);
                yield new OffsetDateTime[]{
                    startOfLastQuarter.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    endOfLastQuarter.atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "THIS_YEAR" -> {
                LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);
                yield new OffsetDateTime[]{
                    startOfYear.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    today.plusDays(1).atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            case "LAST_YEAR" -> {
                LocalDate startOfLastYear = LocalDate.of(today.getYear() - 1, 1, 1);
                LocalDate endOfLastYear = LocalDate.of(today.getYear(), 1, 1);
                yield new OffsetDateTime[]{
                    startOfLastYear.atStartOfDay().atZone(alaskaZone).toOffsetDateTime(),
                    endOfLastYear.atStartOfDay().atZone(alaskaZone).toOffsetDateTime()
                };
            }
            default -> throw new IllegalArgumentException("Unsupported period: " + period);
        };
    }

    /**
     * Apply additional filters to the call list
     */
    private List<CallEntryDto> applyAdditionalFilters(List<CallEntryDto> calls, Map<String, Object> additionalFilters) {
        if (additionalFilters == null || additionalFilters.isEmpty()) {
            return calls;
        }
        
        return calls.stream()
            .filter(call -> {
                // Filter by isAgent if specified
                if (additionalFilters.containsKey("isAgent")) {
                    Boolean isAgent = (Boolean) additionalFilters.get("isAgent");
                    if (isAgent != null && !isAgent.equals(call.getIsAgent())) {
                        return false;
                    }
                }
                
                // Filter by isInbound if specified
                if (additionalFilters.containsKey("isInbound")) {
                    Boolean isInbound = (Boolean) additionalFilters.get("isInbound");
                    if (isInbound != null && !isInbound.equals(call.getIsInbound())) {
                        return false;
                    }
                }
                
                // Filter by programManagementChildId if specified
                if (additionalFilters.containsKey("programManagementChildId")) {
                    String childId = (String) additionalFilters.get("programManagementChildId");
                    if (childId != null && !childId.isEmpty()) {
                        // Convert child ID to name for comparison (simplified approach)
                        // In a more robust implementation, we would join with the child entity
                        // For now, this will help identify if additional filtering is needed
                        log.debug("Additional filtering by programManagementChildId: {} not fully implemented", childId);
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
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
        Map<String, Long> taskBreakdown,
        Map<String, Long> subjectBreakdown
    ) {}

    public record ReportStatistics(
        long pendingReports,
        long runningReports,
        long completedReports,
        long failedReports
    ) {}
}