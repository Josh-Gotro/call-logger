package com.wai.callform.service;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.PbxCallRequest;
import com.wai.callform.entity.CallEntry;
import com.wai.callform.repository.CallEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PbxIntegrationService {

    private final CallEntryRepository callEntryRepository;
    private final CallEntryService callEntryService;

    /**
     * Create a call entry from PBX data
     * This creates a "pending completion" call that needs user input for task/subject/comments
     */
    @Transactional
    public CallEntryDto createCallFromPbx(PbxCallRequest request) {
        log.info("Creating call entry from PBX data: pbxCallId={}, extension={}, email={}",
                request.getPbxCallId(), request.getCallOwnerExtension(), request.getCallOwnerEmail());

        // Check if this PBX call has already been processed
        if (request.getPbxCallId() != null) {
            var existing = callEntryRepository.findByPbxCallId(request.getPbxCallId());
            if (existing.isPresent()) {
                log.warn("PBX call already exists: {}", request.getPbxCallId());
                throw new IllegalStateException("PBX call has already been logged: " + request.getPbxCallId());
            }
        }

        // Determine user email - use provided email or fall back to a default
        String userEmail = request.getCallOwnerEmail();
        if (userEmail == null || userEmail.isBlank()) {
            log.warn("No email provided for extension {}, using extension as email", request.getCallOwnerExtension());
            userEmail = request.getCallOwnerExtension() + "@unknown.local";
        }

        // Create call entry
        CallEntry callEntry = new CallEntry();
        callEntry.setDatatechEmail(userEmail);
        callEntry.setDatatechName(extractNameFromEmail(userEmail));

        // Calculate start time from end time (timestamp) and duration
        OffsetDateTime endTime = request.getTimestamp();
        OffsetDateTime startTime = endTime.minusSeconds(request.getCallDuration());

        callEntry.setStartTime(startTime);
        callEntry.setEndTime(endTime);

        // Set call direction
        callEntry.setIsInbound(request.getCallDirection() == PbxCallRequest.CallDirection.INBOUND);

        // Set PBX-specific fields
        callEntry.setPhoneNumber(request.getPhoneNumber());
        callEntry.setPbxCallId(request.getPbxCallId());
        callEntry.setIsPbxOriginated(true);
        callEntry.setPbxDataReceivedAt(OffsetDateTime.now());

        // Save the entry
        CallEntry savedEntry = callEntryRepository.save(callEntry);
        log.info("Created PBX-originated call entry: id={}, pbxCallId={}",
                savedEntry.getId(), savedEntry.getPbxCallId());

        return callEntryService.getCall(savedEntry.getId());
    }

    /**
     * Get all pending PBX calls (calls that need completion by user)
     */
    public List<CallEntryDto> getPendingPbxCalls() {
        log.debug("Fetching pending PBX calls");

        return callEntryRepository.findByIsPbxOriginatedTrueAndTaskIsNull()
                .stream()
                .map(callEntryService::getCall)
                .toList();
    }

    /**
     * Get pending PBX calls for a specific user
     */
    public List<CallEntryDto> getPendingPbxCallsForUser(String userEmail) {
        log.debug("Fetching pending PBX calls for user: {}", userEmail);

        return callEntryRepository.findByDatatechEmailAndIsPbxOriginatedTrueAndTaskIsNull(userEmail)
                .stream()
                .map(entity -> {
                    try {
                        return callEntryService.getCall(entity.getId());
                    } catch (Exception e) {
                        log.error("Error mapping call entry to DTO", e);
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .toList();
    }

    /**
     * Extract a display name from email address
     */
    private String extractNameFromEmail(String email) {
        if (email == null || email.isBlank()) {
            return "Unknown User";
        }

        // Extract username part before @
        String username = email.split("@")[0];

        // Convert "john.doe" to "John Doe"
        String[] parts = username.split("[._-]");
        StringBuilder name = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                if (name.length() > 0) {
                    name.append(" ");
                }
                name.append(part.substring(0, 1).toUpperCase())
                        .append(part.substring(1).toLowerCase());
            }
        }

        return name.toString();
    }
}
