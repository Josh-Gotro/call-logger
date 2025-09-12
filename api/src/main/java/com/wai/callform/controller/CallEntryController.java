package com.wai.callform.controller;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.StartCallRequest;
import com.wai.callform.dto.UpdateCallRequest;
import com.wai.callform.service.CallEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
@Slf4j
public class CallEntryController {

    private final CallEntryService callEntryService;

    /**
     * Start a new call
     */
    @PostMapping("/start")
    public ResponseEntity<CallEntryDto> startCall(@Valid @RequestBody StartCallRequest request) {
        log.info("Starting new call for user: {}", request.getDatatechEmail());
        CallEntryDto callEntry = callEntryService.startCall(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(callEntry);
    }

    /**
     * End an active call
     */
    @PutMapping("/{callId}/end")
    public ResponseEntity<CallEntryDto> endCall(@PathVariable UUID callId) {
        log.info("Ending call with ID: {}", callId);
        CallEntryDto callEntry = callEntryService.endCall(callId);
        return ResponseEntity.ok(callEntry);
    }

    /**
     * Update call details
     */
    @PutMapping("/{callId}")
    public ResponseEntity<CallEntryDto> updateCall(@PathVariable UUID callId, 
                                                  @Valid @RequestBody UpdateCallRequest request) {
        log.info("Updating call with ID: {}", callId);
        CallEntryDto callEntry = callEntryService.updateCall(callId, request);
        return ResponseEntity.ok(callEntry);
    }

    /**
     * Get call by ID
     */
    @GetMapping("/{callId}")
    public ResponseEntity<CallEntryDto> getCall(@PathVariable UUID callId) {
        log.debug("Getting call with ID: {}", callId);
        CallEntryDto callEntry = callEntryService.getCall(callId);
        return ResponseEntity.ok(callEntry);
    }

    /**
     * Get calls by user with pagination
     */
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<Page<CallEntryDto>> getCallsByUser(@PathVariable String userEmail, 
                                                           Pageable pageable) {
        log.debug("Getting calls for user: {} with pagination", userEmail);
        Page<CallEntryDto> calls = callEntryService.getUserCalls(userEmail, pageable);
        return ResponseEntity.ok(calls);
    }

    /**
     * Get calls within date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<CallEntryDto>> getCallsByDateRange(
            @RequestParam OffsetDateTime startDate,
            @RequestParam OffsetDateTime endDate) {
        log.debug("Getting calls between {} and {}", startDate, endDate);
        List<CallEntryDto> calls = callEntryService.getCallsByDateRange(startDate, endDate);
        return ResponseEntity.ok(calls);
    }

    /**
     * Get calls with filters (for reporting)
     */
    @GetMapping("/filtered")
    public ResponseEntity<Page<CallEntryDto>> getCallsWithFilters(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) UUID taskId,
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) OffsetDateTime startDate,
            @RequestParam(required = false) OffsetDateTime endDate,
            Pageable pageable) {
        log.debug("Getting filtered calls with filters - user: {}, taskId: {}, subjectId: {}", 
                 userEmail, taskId, subjectId);
        
        // Convert camelCase sort fields to database column names
        Pageable convertedPageable = convertSortFields(pageable);
        
        Page<CallEntryDto> calls = callEntryService.getCallsWithFilters(
            userEmail, taskId, subjectId, startDate, endDate, convertedPageable);
        return ResponseEntity.ok(calls);
    }
    
    private Pageable convertSortFields(Pageable pageable) {
        if (pageable.getSort().isEmpty()) {
            return pageable;
        }
        
        List<org.springframework.data.domain.Sort.Order> convertedOrders = pageable.getSort().stream()
            .map(order -> {
                String property = order.getProperty();
                // Convert snake_case to camelCase for entity properties
                String convertedProperty = property.equals("start_time") ? "startTime" :
                                         property.equals("end_time") ? "endTime" :
                                         property.equals("created_at") ? "createdAt" :
                                         property.equals("updated_at") ? "updatedAt" :
                                         property;
                return new org.springframework.data.domain.Sort.Order(order.getDirection(), convertedProperty);
            })
            .toList();
        
        org.springframework.data.domain.Sort convertedSort = org.springframework.data.domain.Sort.by(convertedOrders);
        return org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), convertedSort);
    }

    /**
     * Get active call for user
     */
    @GetMapping("/user/{userEmail}/active")
    public ResponseEntity<CallEntryDto> getActiveCallByUser(@PathVariable String userEmail) {
        log.debug("Getting active call for user: {}", userEmail);
        var activeCall = callEntryService.getUserActiveCall(userEmail);
        if (activeCall.isPresent()) {
            return ResponseEntity.ok(activeCall.get());
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<String>> getAllUsers() {
        log.debug("Getting all unique user emails");
        List<String> users = callEntryService.getAllUniqueUserEmails();
        return ResponseEntity.ok(users);
    }
}