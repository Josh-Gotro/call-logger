package com.wai.callform.entity;

// import com.wai.callform.validation.ValidProgramManagementHierarchy; // Old validation - removed
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "call_entries")
@Data
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
// Task-Subject validation will be handled at service layer
public class CallEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "datatech_name", nullable = false)
    private String datatechName;

    @NotNull
    @Email
    @Size(max = 255)
    @Column(name = "datatech_email", nullable = false)
    private String datatechEmail;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    // Boolean fields (required, no nulls allowed)
    @NotNull
    @Column(name = "is_inbound", nullable = false)
    private Boolean isInbound = false;

    @NotNull
    @Column(name = "is_agent", nullable = false)
    private Boolean isAgent = false;

    // Foreign key relationships to new task/subject tables
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private SubjectEntity subject;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    // PBX integration fields
    @Size(max = 50)
    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Size(max = 100)
    @Column(name = "pbx_call_id", length = 100)
    private String pbxCallId;

    @NotNull
    @Column(name = "is_pbx_originated", nullable = false)
    private Boolean isPbxOriginated = false;

    @Column(name = "pbx_data_received_at")
    private OffsetDateTime pbxDataReceivedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Task-Subject validation
    public boolean hasValidTaskSubjectRelationship() {
        // If subject is selected, task must also be selected
        if (subject != null && task == null) {
            return false;
        }
        // If both are selected, subject must be valid for the task
        // This validation will be performed at the service layer
        return true;
    }

    public String getTaskDisplay() {
        if (task == null) {
            return null;
        }
        if (subject != null) {
            return task.getName() + " - " + subject.getName();
        }
        return task.getName();
    }

    public String getTaskSubjectDisplay() {
        return getTaskDisplay();
    }

    // Business logic methods
    public boolean isCallInProgress() {
        return startTime != null && endTime == null;
    }

    public boolean isCallCompleted() {
        return startTime != null && endTime != null;
    }

    public long getCallDurationMinutes() {
        if (startTime == null || endTime == null) {
            return 0;
        }
        return java.time.Duration.between(startTime, endTime).toMinutes();
    }
}