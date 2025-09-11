package com.wai.callform.service;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.StartCallRequest;
import com.wai.callform.dto.UpdateCallRequest;
import com.wai.callform.entity.CallEntry;
import com.wai.callform.entity.CategoryItem;
import com.wai.callform.entity.ProgramManagementItem;
import com.wai.callform.entity.SubjectItem;
import com.wai.callform.repository.CallEntryRepository;
import com.wai.callform.repository.CategoryItemRepository;
import com.wai.callform.repository.ProgramManagementItemRepository;
import com.wai.callform.repository.SubjectItemRepository;
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
    private final CategoryItemRepository categoryItemRepository;
    private final SubjectItemRepository subjectItemRepository;
    private final ProgramManagementItemRepository programManagementItemRepository;

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
        
        // Update reference fields using IDs
        if (request.getProgramManagementParentId() != null && !request.getProgramManagementParentId().isEmpty()) {
            try {
                UUID parentId = UUID.fromString(request.getProgramManagementParentId());
                ProgramManagementItem parent = programManagementItemRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Program Management Parent not found: " + parentId));
                callEntry.setProgramManagementParent(parent);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Program Management Parent ID: {}", request.getProgramManagementParentId());
                throw new IllegalArgumentException("Invalid Program Management Parent ID");
            }
        } else {
            callEntry.setProgramManagementParent(null);
        }
        
        if (request.getProgramManagementChildId() != null && !request.getProgramManagementChildId().isEmpty()) {
            try {
                UUID childId = UUID.fromString(request.getProgramManagementChildId());
                ProgramManagementItem child = programManagementItemRepository.findById(childId)
                    .orElseThrow(() -> new IllegalArgumentException("Program Management Child not found: " + childId));
                callEntry.setProgramManagementChild(child);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Program Management Child ID: {}", request.getProgramManagementChildId());
                throw new IllegalArgumentException("Invalid Program Management Child ID");
            }
        } else {
            callEntry.setProgramManagementChild(null);
        }
        
        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            try {
                UUID categoryId = UUID.fromString(request.getCategoryId());
                CategoryItem category = categoryItemRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));
                callEntry.setCategory(category);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Category ID: {}", request.getCategoryId());
                throw new IllegalArgumentException("Invalid Category ID");
            }
        } else {
            callEntry.setCategory(null);
        }
        
        if (request.getSubjectId() != null && !request.getSubjectId().isEmpty()) {
            try {
                UUID subjectId = UUID.fromString(request.getSubjectId());
                SubjectItem subject = subjectItemRepository.findById(subjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));
                callEntry.setSubject(subject);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Subject ID: {}", request.getSubjectId());
                throw new IllegalArgumentException("Invalid Subject ID");
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
            UUID programParentId,
            UUID categoryId,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Pageable pageable) {
        return callEntryRepository.findWithFilters(userEmail, startDate, endDate, pageable)
                .map(this::mapToDto);
    }

    // Note: Distinct values for dropdowns are now handled by ReferenceDataService
    // using the dedicated reference tables (ProgramManagementItem, CategoryItem, SubjectItem)

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
        dto.setProgramManagement(entity.getProgramManagementDisplay());
        dto.setCategory(entity.getCategory() != null ? entity.getCategory().getName() : null);
        dto.setSubject(entity.getSubject() != null ? entity.getSubject().getName() : null);
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
     * Statistics DTO for reporting
     */
    public record CallStatistics(
            long totalCalls,
            long completedCalls,
            long inProgressCalls,
            double averageDurationMinutes) {
    }
}