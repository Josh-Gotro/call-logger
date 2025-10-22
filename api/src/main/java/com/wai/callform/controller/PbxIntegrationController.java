package com.wai.callform.controller;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.CallGroupAlertDto;
import com.wai.callform.dto.PbxCallRequest;
import com.wai.callform.service.CallGroupAlertService;
import com.wai.callform.service.PbxIntegrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PbxIntegrationController {

    private final PbxIntegrationService pbxIntegrationService;
    private final CallGroupAlertService callGroupAlertService;

    /**
     * Endpoint for 3CX integration to submit call data
     */
    @PostMapping("/calls/from-pbx")
    public ResponseEntity<CallEntryDto> createCallFromPbx(@Valid @RequestBody PbxCallRequest request) {
        log.info("Received PBX call data: pbxCallId={}, extension={}, phoneNumber={}",
                request.getPbxCallId(), request.getCallOwnerExtension(), request.getPhoneNumber());

        try {
            CallEntryDto callEntry = pbxIntegrationService.createCallFromPbx(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(callEntry);
        } catch (IllegalStateException e) {
            log.warn("PBX call already exists: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            log.error("Error processing PBX call", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all pending PBX calls (calls that need user completion)
     */
    @GetMapping("/calls/pending-pbx")
    public ResponseEntity<List<CallEntryDto>> getPendingPbxCalls() {
        log.debug("Getting all pending PBX calls");
        List<CallEntryDto> pendingCalls = pbxIntegrationService.getPendingPbxCalls();
        return ResponseEntity.ok(pendingCalls);
    }

    /**
     * Get pending PBX calls for a specific user
     */
    @GetMapping("/calls/user/{userEmail}/pending-pbx")
    public ResponseEntity<List<CallEntryDto>> getPendingPbxCallsForUser(@PathVariable String userEmail) {
        log.debug("Getting pending PBX calls for user: {}", userEmail);
        List<CallEntryDto> pendingCalls = pbxIntegrationService.getPendingPbxCallsForUser(userEmail);
        return ResponseEntity.ok(pendingCalls);
    }

    /**
     * Submit call group alert
     */
    @PostMapping("/alerts/call-groups")
    public ResponseEntity<CallGroupAlertDto> createCallGroupAlert(@Valid @RequestBody CallGroupAlertDto alertDto) {
        log.info("Received call group alert: groupId={}, type={}",
                alertDto.getCallGroupId(), alertDto.getAlertType());

        CallGroupAlertDto createdAlert = callGroupAlertService.createOrUpdateAlert(alertDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAlert);
    }

    /**
     * Get active call group alerts
     */
    @GetMapping("/alerts/call-groups")
    public ResponseEntity<List<CallGroupAlertDto>> getActiveAlerts(
            @RequestParam(required = false, defaultValue = "true") Boolean active) {
        log.debug("Getting call group alerts (active={})", active);

        if (active) {
            List<CallGroupAlertDto> alerts = callGroupAlertService.getActiveAlerts();
            return ResponseEntity.ok(alerts);
        } else {
            // If we want to support getting all alerts (active and resolved), we'd need a new method
            return ResponseEntity.ok(callGroupAlertService.getActiveAlerts());
        }
    }

    /**
     * Get alerts for a specific call group
     */
    @GetMapping("/alerts/call-groups/{callGroupId}")
    public ResponseEntity<List<CallGroupAlertDto>> getAlertsForCallGroup(@PathVariable String callGroupId) {
        log.debug("Getting alerts for call group: {}", callGroupId);
        List<CallGroupAlertDto> alerts = callGroupAlertService.getAlertsForCallGroup(callGroupId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Resolve an alert
     */
    @PutMapping("/alerts/call-groups/{alertId}/resolve")
    public ResponseEntity<CallGroupAlertDto> resolveAlert(@PathVariable UUID alertId) {
        log.info("Resolving alert: {}", alertId);
        CallGroupAlertDto resolvedAlert = callGroupAlertService.resolveAlert(alertId);
        return ResponseEntity.ok(resolvedAlert);
    }

    /**
     * Health check endpoint for 3CX integration
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("ok", System.currentTimeMillis()));
    }

    /**
     * Simple health response record
     */
    public record HealthResponse(String status, long timestamp) {
    }
}
