package com.wai.callform.service;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.StartCallRequest;
import com.wai.callform.dto.UpdateCallRequest;
import com.wai.callform.entity.CallEntry;
import com.wai.callform.entity.TaskEntity;
import com.wai.callform.entity.SubjectEntity;
import com.wai.callform.repository.CallEntryRepository;
import com.wai.callform.repository.TaskEntityRepository;
import com.wai.callform.repository.SubjectEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CallEntryService {

    private final CallEntryRepository callEntryRepository;
    private final TaskEntityRepository taskEntityRepository;
    private final SubjectEntityRepository subjectEntityRepository;
    private final TaskSubjectService taskSubjectService;

    /**
     * Start a new call for the specified user
     */
    @Transactional
    public CallEntryDto startCall(StartCallRequest request) {
        log.info("Starting new call for user: {}", request.getDatatechEmail());

        // Check if user already has an active call
        Optional<CallEntry> existingCall = callEntryRepository.findActiveCallByUser(request.getDatatechEmail());
        if (existingCall.isPresent()) {
            throw new IllegalStateException("User already has an active call in progress");
        }

        CallEntry callEntry = new CallEntry();
        callEntry.setDatatechName(request.getDatatechName());
        callEntry.setDatatechEmail(request.getDatatechEmail());
        callEntry.setStartTime(OffsetDateTime.now());

        CallEntry savedCall = callEntryRepository.save(callEntry);
        log.info("Created new call entry with ID: {}", savedCall.getId());

        return mapToDto(savedCall);
    }

    /**
     * End an active call
     */
    @Transactional
    public CallEntryDto endCall(UUID callId) {
        log.info("Ending call with ID: {}", callId);

        CallEntry callEntry = callEntryRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found"));

        if (callEntry.getEndTime() != null) {
            throw new IllegalStateException("Call has already been ended");
        }

        callEntry.setEndTime(OffsetDateTime.now());
        CallEntry savedCall = callEntryRepository.save(callEntry);

        log.info("Ended call ID: {}, duration: {} minutes",
                savedCall.getId(), savedCall.getCallDurationMinutes());

        return mapToDto(savedCall);
    }

    /**
     * Update call details
     */
    @Transactional
    public CallEntryDto updateCall(UUID callId, UpdateCallRequest request) {
        log.info("Updating call with ID: {}", callId);

        CallEntry callEntry = callEntryRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found"));

        // Update boolean fields
        if (request.getIsInbound() != null) {
            callEntry.setIsInbound(request.getIsInbound());
        }
        if (request.getIsAgent() != null) {
            callEntry.setIsAgent(request.getIsAgent());
        }

        // Update time fields
        if (request.getStartTime() != null) {
            callEntry.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            callEntry.setEndTime(request.getEndTime());
        }

        // Update comments
        if (request.getComments() != null) {
            callEntry.setComments(request.getComments());
        }

        // Update Task and Subject using new model
        if (request.getTaskId() != null) {
            TaskEntity task = taskEntityRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new IllegalArgumentException("Task not found: " + request.getTaskId()));
            callEntry.setTask(task);
        } else {
            callEntry.setTask(null);
        }

        if (request.getSubjectId() != null) {
            SubjectEntity subject = subjectEntityRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));
            callEntry.setSubject(subject);

            // Validate that the subject is valid for the selected task
            if (callEntry.getTask() != null) {
                boolean isValid = taskSubjectService.isSubjectValidForTask(callEntry.getTask().getId(),
                        subject.getId());
                if (!isValid) {
                    throw new IllegalArgumentException("Subject is not valid for the selected task");
                }
            }
        } else {
            callEntry.setSubject(null);
        }

        CallEntry savedCall = callEntryRepository.save(callEntry);
        log.info("Updated call ID: {}", savedCall.getId());

        return mapToDto(savedCall);
    }

    /**
     * Get call by ID
     */
    public CallEntryDto getCall(UUID callId) {
        CallEntry callEntry = callEntryRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found"));
        return mapToDto(callEntry);
    }

    /**
     * Get user's active call (if any)
     */
    public Optional<CallEntryDto> getUserActiveCall(String userEmail) {
        return callEntryRepository.findActiveCallByUser(userEmail)
                .map(this::mapToDto);
    }

    /**
     * Get calls for a user with pagination
     */
    public Page<CallEntryDto> getUserCalls(String userEmail, Pageable pageable) {
        return callEntryRepository.findByDatatechEmailOrderByStartTimeDesc(userEmail, pageable)
                .map(this::mapToDto);
    }

    /**
     * Get calls within date range
     */
    public List<CallEntryDto> getCallsByDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        return callEntryRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Get calls with filters for reporting
     */
    public Page<CallEntryDto> getCallsWithFilters(String userEmail,
            UUID taskId,
            UUID subjectId,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Pageable pageable) {

        // Simple fallback filtering logic - build filters step by step
        Page<CallEntry> result;

        if (userEmail != null && startDate != null && endDate != null) {
            // User + date range filtering
            result = callEntryRepository.findByDatatechEmailAndStartTimeBetween(userEmail, startDate, endDate,
                    pageable);
        } else if (userEmail != null) {
            // User filtering only
            result = callEntryRepository.findByDatatechEmail(userEmail, pageable);
        } else if (startDate != null && endDate != null) {
            // Date range only
            result = callEntryRepository.findByDateRange(startDate, endDate, pageable);
        } else {
            // No filtering - return all with pagination
            result = callEntryRepository.findAll(pageable);
        }

        // Convert to DTOs first
        List<CallEntryDto> allDtos = result.getContent().stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());

        // Apply task and subject filtering in-memory
        List<CallEntryDto> filteredDtos = allDtos.stream()
                .filter(dto -> {
                    // Filter by taskId
                    boolean matchesTask = taskId == null ||
                            (dto.getTaskId() != null && dto.getTaskId().equals(taskId));

                    // Filter by subjectId
                    boolean matchesSubject = subjectId == null ||
                            (dto.getSubjectId() != null && dto.getSubjectId().equals(subjectId));

                    return matchesTask && matchesSubject;
                })
                .collect(java.util.stream.Collectors.toList());

        // Create new Page with filtered results
        return new org.springframework.data.domain.PageImpl<>(
                filteredDtos,
                pageable,
                filteredDtos.size());
    }

    // Note: Distinct values for dropdowns are now handled by ReferenceDataService

    /**
     * Get call statistics for user
     */
    public CallStatistics getUserCallStatistics(String userEmail,
            OffsetDateTime startDate,
            OffsetDateTime endDate) {
        List<CallEntry> calls = callEntryRepository.findByUserAndDateRange(userEmail, startDate, endDate);

        long totalCalls = calls.size();
        long completedCalls = calls.stream().filter(CallEntry::isCallCompleted).count();
        long inProgressCalls = calls.stream().filter(CallEntry::isCallInProgress).count();
        double avgDuration = calls.stream()
                .filter(CallEntry::isCallCompleted)
                .mapToLong(CallEntry::getCallDurationMinutes)
                .average()
                .orElse(0.0);

        return new CallStatistics(totalCalls, completedCalls, inProgressCalls, avgDuration);
    }

    /**
     * Map entity to DTO
     */
    private CallEntryDto mapToDto(CallEntry entity) {
        CallEntryDto dto = new CallEntryDto();
        dto.setId(entity.getId());
        dto.setDatatechName(entity.getDatatechName());
        dto.setDatatechEmail(entity.getDatatechEmail());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setIsInbound(entity.getIsInbound());
        dto.setTaskId(entity.getTask() != null ? entity.getTask().getId() : null);
        dto.setTaskName(entity.getTask() != null ? entity.getTask().getName() : null);
        dto.setSubjectId(entity.getSubject() != null ? entity.getSubject().getId() : null);
        dto.setSubjectName(entity.getSubject() != null ? entity.getSubject().getName() : null);
        dto.setTaskSubjectDisplay(entity.getTaskSubjectDisplay());
        dto.setIsAgent(entity.getIsAgent());
        dto.setComments(entity.getComments());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Set computed fields
        dto.setInProgress(entity.isCallInProgress());
        dto.setCompleted(entity.isCallCompleted());
        dto.setDurationMinutes(entity.getCallDurationMinutes());

        return dto;
    }

    /**
     * Get all unique user emails from call entries
     */
    public List<String> getAllUniqueUserEmails() {
        log.debug("Fetching all unique user emails");
        return callEntryRepository.findDistinctDatatechEmails();
    }

    /**
     * Statistics DTO for reporting
     */
    public record CallStatistics(
            long totalCalls,
            long completedCalls,
            long inProgressCalls,
            double averageDurationMinutes) {
    }
}