package com.wai.callform.service;

import com.wai.callform.dto.CallEntryDto;
import com.wai.callform.dto.PbxCallRequest;
import com.wai.callform.entity.CallEntry;
import com.wai.callform.repository.CallEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PbxIntegrationServiceTest {

    @Mock
    private CallEntryRepository callEntryRepository;

    @Mock
    private CallEntryService callEntryService;

    @InjectMocks
    private PbxIntegrationService pbxIntegrationService;

    private PbxCallRequest testRequest;
    private CallEntry testCallEntry;

    @BeforeEach
    void setUp() {
        // Create test PBX call request
        testRequest = new PbxCallRequest();
        testRequest.setPbxCallId("3cx-call-12345");
        testRequest.setPhoneNumber("9075551234");
        testRequest.setCallDuration(300); // 5 minutes
        testRequest.setCallOwnerExtension("101");
        testRequest.setCallOwnerEmail("john.doe@wostmann.com");
        testRequest.setCallDirection(PbxCallRequest.CallDirection.INBOUND);
        testRequest.setTimestamp(OffsetDateTime.now());

        // Create test call entry
        testCallEntry = new CallEntry();
        testCallEntry.setId(UUID.randomUUID());
        testCallEntry.setPbxCallId(testRequest.getPbxCallId());
        testCallEntry.setPhoneNumber(testRequest.getPhoneNumber());
        testCallEntry.setDatatechEmail(testRequest.getCallOwnerEmail());
        testCallEntry.setIsPbxOriginated(true);
    }

    @Test
    void testCreateCallFromPbx_Success() {
        // Arrange
        when(callEntryRepository.findByPbxCallId(testRequest.getPbxCallId())).thenReturn(Optional.empty());
        when(callEntryRepository.save(any(CallEntry.class))).thenReturn(testCallEntry);

        CallEntryDto expectedDto = new CallEntryDto();
        expectedDto.setId(testCallEntry.getId());
        expectedDto.setPbxCallId(testCallEntry.getPbxCallId());
        when(callEntryService.getCall(testCallEntry.getId())).thenReturn(expectedDto);

        // Act
        CallEntryDto result = pbxIntegrationService.createCallFromPbx(testRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testCallEntry.getId(), result.getId());
        assertEquals(testRequest.getPbxCallId(), result.getPbxCallId());

        verify(callEntryRepository).findByPbxCallId(testRequest.getPbxCallId());
        verify(callEntryRepository).save(any(CallEntry.class));
        verify(callEntryService).getCall(testCallEntry.getId());
    }

    @Test
    void testCreateCallFromPbx_DuplicateCall() {
        // Arrange
        when(callEntryRepository.findByPbxCallId(testRequest.getPbxCallId()))
                .thenReturn(Optional.of(testCallEntry));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            pbxIntegrationService.createCallFromPbx(testRequest);
        });

        verify(callEntryRepository).findByPbxCallId(testRequest.getPbxCallId());
        verify(callEntryRepository, never()).save(any(CallEntry.class));
    }

    @Test
    void testCreateCallFromPbx_NoEmailProvided() {
        // Arrange
        testRequest.setCallOwnerEmail(null);
        when(callEntryRepository.findByPbxCallId(testRequest.getPbxCallId())).thenReturn(Optional.empty());
        when(callEntryRepository.save(any(CallEntry.class))).thenReturn(testCallEntry);

        CallEntryDto expectedDto = new CallEntryDto();
        expectedDto.setId(testCallEntry.getId());
        when(callEntryService.getCall(any(UUID.class))).thenReturn(expectedDto);

        // Act
        CallEntryDto result = pbxIntegrationService.createCallFromPbx(testRequest);

        // Assert
        assertNotNull(result);
        verify(callEntryRepository).save(argThat(callEntry ->
            callEntry.getDatatechEmail().contains("@unknown.local")
        ));
    }

    @Test
    void testGetPendingPbxCalls() {
        // Arrange
        when(callEntryRepository.findByIsPbxOriginatedTrueAndTaskIsNull())
                .thenReturn(java.util.List.of(testCallEntry));

        CallEntryDto dto = new CallEntryDto();
        dto.setId(testCallEntry.getId());
        when(callEntryService.getCall(testCallEntry.getId())).thenReturn(dto);

        // Act
        var result = pbxIntegrationService.getPendingPbxCalls();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testCallEntry.getId(), result.get(0).getId());
    }
}
