package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "report_runs")
@Data
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class ReportRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters", columnDefinition = "jsonb")
    private Map<String, Object> parameters;

    @Size(max = 500)
    @Column(name = "result_url")
    private String resultUrl;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    // Enums for type safety
    public enum ReportStatus {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED
    }

    public enum ReportType {
        LIVE,
        ASYNC_USER,
        ASYNC_TEAM,
        ASYNC_FULL
    }

    // Business logic methods
    public boolean isInProgress() {
        return status == ReportStatus.RUNNING;
    }

    public boolean isCompleted() {
        return status == ReportStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == ReportStatus.FAILED;
    }

    public void markAsStarted() {
        this.status = ReportStatus.RUNNING;
        this.startedAt = OffsetDateTime.now();
    }

    public void markAsCompleted(String resultUrl) {
        this.status = ReportStatus.COMPLETED;
        this.resultUrl = resultUrl;
        this.completedAt = OffsetDateTime.now();
        this.errorMessage = null;
    }

    public void markAsFailed(String errorMessage) {
        this.status = ReportStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = OffsetDateTime.now();
    }

    public long getProcessingTimeMinutes() {
        if (startedAt == null || completedAt == null) {
            return 0;
        }
        return java.time.Duration.between(startedAt, completedAt).toMinutes();
    }
}