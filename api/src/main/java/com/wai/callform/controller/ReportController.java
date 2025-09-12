package com.wai.callform.controller;

import com.wai.callform.dto.ReportRequest;
import com.wai.callform.dto.ReportRunDto;
import com.wai.callform.service.ReportService;
import com.wai.callform.service.ReportService.LiveReportResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3003"})
public class ReportController {

    private final ReportService reportService;

    /**
     * Generate a live report with comprehensive filtering
     */
    @PostMapping("/live")
    public ResponseEntity<LiveReportResult> generateLiveReport(@Valid @RequestBody ReportRequest request) {
        log.info("Generating live report for user: {}", request.getRequestedBy());
        try {
            LiveReportResult result = reportService.generateLiveReport(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error generating live report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get report data by predefined time periods
     */
    @GetMapping("/period/{period}")
    public ResponseEntity<LiveReportResult> getReportByPeriod(
            @PathVariable String period,
            @RequestParam(required = false) String datatechEmail,
            @RequestParam(required = false) String programManagementParentId,
            @RequestParam(required = false) String programManagementChildId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) Boolean isInbound,
            @RequestParam(required = false) Boolean isAgent,
            @RequestParam String requestedBy) {
        
        log.info("Generating {} report for user: {}", period, requestedBy);
        
        try {
            ReportRequest request = reportService.buildPeriodRequest(
                period, requestedBy, datatechEmail, programManagementParentId, 
                programManagementChildId, categoryId, subjectId, isInbound, isAgent
            );
            
            LiveReportResult result = reportService.generateLiveReport(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error generating {} report", period, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get report data for a specific date range
     */
    @GetMapping("/daterange")
    public ResponseEntity<LiveReportResult> getReportByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String datatechEmail,
            @RequestParam(required = false) String programManagementParentId,
            @RequestParam(required = false) String programManagementChildId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) Boolean isInbound,
            @RequestParam(required = false) Boolean isAgent,
            @RequestParam String requestedBy) {
        
        log.info("Generating date range report ({} to {}) for user: {}", startDate, endDate, requestedBy);
        
        try {
            ReportRequest request = new ReportRequest();
            request.setReportType("LIVE");
            request.setRequestedBy(requestedBy);
            request.setStartDate(startDate.atStartOfDay().atZone(ZoneId.of("America/Anchorage")).toOffsetDateTime());
            request.setEndDate(endDate.plusDays(1).atStartOfDay().atZone(ZoneId.of("America/Anchorage")).toOffsetDateTime());
            request.setUserEmail(datatechEmail);
            request.setTaskName(programManagementParentId);
            request.setSubjectName(categoryId);
            // Note: subjectId parameter used for legacy compatibility
            
            // Add additional filters
            if (programManagementChildId != null || isInbound != null || isAgent != null) {
                Map<String, Object> additionalFilters = new java.util.HashMap<>();
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
            
            LiveReportResult result = reportService.generateLiveReport(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error generating date range report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export report as CSV
     */
    @PostMapping("/export/csv")
    public ResponseEntity<Resource> exportReportCsv(@Valid @RequestBody ReportRequest request) {
        log.info("Exporting CSV report for user: {}", request.getRequestedBy());
        
        try {
            String csvContent = reportService.generateCsvReport(request);
            ByteArrayInputStream bis = new ByteArrayInputStream(csvContent.getBytes("UTF-8"));
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=report.csv");
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(csvContent.getBytes("UTF-8").length)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(new InputStreamResource(bis));
                    
        } catch (Exception e) {
            log.error("Error exporting CSV report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export report by period as CSV
     */
    @GetMapping("/export/csv/{period}")
    public ResponseEntity<Resource> exportPeriodReportCsv(
            @PathVariable String period,
            @RequestParam(required = false) String datatechEmail,
            @RequestParam(required = false) String programManagementParentId,
            @RequestParam(required = false) String programManagementChildId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) Boolean isInbound,
            @RequestParam(required = false) Boolean isAgent,
            @RequestParam String requestedBy) {
        
        log.info("Exporting {} CSV report for user: {}", period, requestedBy);
        
        try {
            ReportRequest request = reportService.buildPeriodRequest(
                period, requestedBy, datatechEmail, programManagementParentId, 
                programManagementChildId, categoryId, subjectId, isInbound, isAgent
            );
            
            String csvContent = reportService.generateCsvReport(request);
            ByteArrayInputStream bis = new ByteArrayInputStream(csvContent.getBytes("UTF-8"));
            
            String filename = String.format("report-%s-%s.csv", period.toLowerCase(), 
                    java.time.LocalDate.now().toString());
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=" + filename);
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(csvContent.getBytes("UTF-8").length)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(new InputStreamResource(bis));
                    
        } catch (Exception e) {
            log.error("Error exporting {} CSV report", period, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Queue an async report
     */
    @PostMapping("/async")
    public ResponseEntity<ReportRunDto> queueAsyncReport(@Valid @RequestBody ReportRequest request) {
        log.info("Queueing async report for user: {}", request.getRequestedBy());
        try {
            ReportRunDto result = reportService.queueAsyncReport(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error queueing async report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get report status
     */
    @GetMapping("/{reportId}/status")
    public ResponseEntity<ReportRunDto> getReportStatus(@PathVariable UUID reportId) {
        try {
            ReportRunDto result = reportService.getReportStatus(reportId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting report status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user's report history
     */
    @GetMapping("/history")
    public ResponseEntity<Page<ReportRunDto>> getUserReports(
            @RequestParam String userEmail,
            Pageable pageable) {
        try {
            Page<ReportRunDto> result = reportService.getUserReports(userEmail, pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting user reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get available report periods
     */
    @GetMapping("/periods")
    public ResponseEntity<List<Map<String, Object>>> getAvailablePeriods() {
        List<Map<String, Object>> periods = List.of(
                Map.of("key", "THIS_WEEK", "label", "This Week", "description", "Monday to today"),
                Map.of("key", "LAST_WEEK", "label", "Last Week", "description", "Previous complete week"),
                Map.of("key", "THIS_MONTH", "label", "This Month", "description", "First day of month to today"),
                Map.of("key", "LAST_MONTH", "label", "Last Month", "description", "Previous complete month"),
                Map.of("key", "THIS_QUARTER", "label", "Current Quarter", "description", "Start of quarter to today"),
                Map.of("key", "LAST_QUARTER", "label", "Previous Quarter", "description", "Previous complete quarter"),
                Map.of("key", "THIS_YEAR", "label", "Year to Date", "description", "January 1 to today"),
                Map.of("key", "LAST_YEAR", "label", "Previous Year", "description", "Previous complete year")
        );
        return ResponseEntity.ok(periods);
    }

    /**
     * Process pending report (for testing)
     */
    @PostMapping("/{reportId}/process")
    public ResponseEntity<ReportRunDto> processReport(@PathVariable UUID reportId) {
        try {
            ReportRunDto result = reportService.processReport(reportId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error processing report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get report statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ReportService.ReportStatistics> getReportStatistics() {
        try {
            ReportService.ReportStatistics stats = reportService.getReportStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting report statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}