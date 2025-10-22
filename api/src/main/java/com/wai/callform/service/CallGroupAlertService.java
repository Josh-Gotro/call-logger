package com.wai.callform.service;

import com.wai.callform.dto.CallGroupAlertDto;
import com.wai.callform.entity.CallGroupAlert;
import com.wai.callform.repository.CallGroupAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CallGroupAlertService {

    private final CallGroupAlertRepository alertRepository;

    /**
     * Create or update an alert for a call group
     * If an active alert already exists for the group, it won't create a duplicate
     */
    @Transactional
    public CallGroupAlertDto createOrUpdateAlert(CallGroupAlertDto alertDto) {
        log.info("Creating/updating alert for call group: {}", alertDto.getCallGroupId());

        // Check if an active alert already exists for this call group
        var existingAlert = alertRepository.findByCallGroupIdAndIsActiveTrue(alertDto.getCallGroupId());

        if (existingAlert.isPresent()) {
            log.info("Active alert already exists for call group: {}", alertDto.getCallGroupId());
            return mapToDto(existingAlert.get());
        }

        // Create new alert
        CallGroupAlert alert = new CallGroupAlert();
        alert.setCallGroupId(alertDto.getCallGroupId());
        alert.setCallGroupName(alertDto.getCallGroupName());
        alert.setAlertType(alertDto.getAlertType());
        alert.setAlertMessage(alertDto.getAlertMessage());
        alert.setIsActive(true);

        CallGroupAlert savedAlert = alertRepository.save(alert);
        log.info("Created new alert: id={}, callGroupId={}", savedAlert.getId(), savedAlert.getCallGroupId());

        return mapToDto(savedAlert);
    }

    /**
     * Get all active alerts
     */
    public List<CallGroupAlertDto> getActiveAlerts() {
        log.debug("Fetching active alerts");
        return alertRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Get all alerts for a specific call group
     */
    public List<CallGroupAlertDto> getAlertsForCallGroup(String callGroupId) {
        log.debug("Fetching alerts for call group: {}", callGroupId);
        return alertRepository.findByCallGroupIdOrderByCreatedAtDesc(callGroupId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Resolve an alert
     */
    @Transactional
    public CallGroupAlertDto resolveAlert(UUID alertId) {
        log.info("Resolving alert: {}", alertId);

        CallGroupAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));

        if (!alert.isCurrentlyActive()) {
            log.warn("Alert is already resolved: {}", alertId);
        }

        alert.resolve();
        CallGroupAlert savedAlert = alertRepository.save(alert);

        log.info("Alert resolved: id={}", savedAlert.getId());
        return mapToDto(savedAlert);
    }

    /**
     * Resolve all active alerts for a call group
     */
    @Transactional
    public void resolveAlertsForCallGroup(String callGroupId) {
        log.info("Resolving all alerts for call group: {}", callGroupId);

        var activeAlert = alertRepository.findByCallGroupIdAndIsActiveTrue(callGroupId);
        activeAlert.ifPresent(alert -> {
            alert.resolve();
            alertRepository.save(alert);
            log.info("Resolved alert for call group: {}", callGroupId);
        });
    }

    /**
     * Check if there's an active alert for a call group
     */
    public boolean hasActiveAlert(String callGroupId) {
        return alertRepository.existsActiveAlertForCallGroup(callGroupId);
    }

    /**
     * Get alerts by type
     */
    public List<CallGroupAlertDto> getAlertsByType(String alertType) {
        log.debug("Fetching alerts by type: {}", alertType);
        return alertRepository.findByAlertTypeAndIsActiveTrue(alertType)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Map entity to DTO
     */
    private CallGroupAlertDto mapToDto(CallGroupAlert entity) {
        CallGroupAlertDto dto = new CallGroupAlertDto();
        dto.setId(entity.getId());
        dto.setCallGroupId(entity.getCallGroupId());
        dto.setCallGroupName(entity.getCallGroupName());
        dto.setAlertType(entity.getAlertType());
        dto.setAlertMessage(entity.getAlertMessage());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setResolvedAt(entity.getResolvedAt());
        return dto;
    }
}
