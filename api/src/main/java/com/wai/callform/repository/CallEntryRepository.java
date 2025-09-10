package com.wai.callform.repository;

import com.wai.callform.entity.CallEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CallEntryRepository extends JpaRepository<CallEntry, UUID> {

    // Find calls by user email
    List<CallEntry> findByDatatechEmailOrderByStartTimeDesc(String datatechEmail);

    // Find calls by user email with pagination
    Page<CallEntry> findByDatatechEmailOrderByStartTimeDesc(String datatechEmail, Pageable pageable);

    // Find calls in progress (started but not ended)
    @Query("SELECT c FROM CallEntry c WHERE c.startTime IS NOT NULL AND c.endTime IS NULL")
    List<CallEntry> findCallsInProgress();

    // Find calls in progress for specific user
    @Query("SELECT c FROM CallEntry c WHERE c.datatechEmail = :email AND c.startTime IS NOT NULL AND c.endTime IS NULL")
    Optional<CallEntry> findActiveCallByUser(@Param("email") String datatechEmail);

    // Find calls within date range
    @Query("SELECT c FROM CallEntry c WHERE c.startTime BETWEEN :startDate AND :endDate ORDER BY c.startTime DESC")
    List<CallEntry> findByDateRange(@Param("startDate") OffsetDateTime startDate, 
                                   @Param("endDate") OffsetDateTime endDate);

    // Find calls within date range with pagination
    @Query("SELECT c FROM CallEntry c WHERE c.startTime BETWEEN :startDate AND :endDate ORDER BY c.startTime DESC")
    Page<CallEntry> findByDateRange(@Param("startDate") OffsetDateTime startDate, 
                                   @Param("endDate") OffsetDateTime endDate, 
                                   Pageable pageable);

    // Find calls by user within date range
    @Query("SELECT c FROM CallEntry c WHERE c.datatechEmail = :email AND c.startTime BETWEEN :startDate AND :endDate ORDER BY c.startTime DESC")
    List<CallEntry> findByUserAndDateRange(@Param("email") String datatechEmail,
                                          @Param("startDate") OffsetDateTime startDate,
                                          @Param("endDate") OffsetDateTime endDate);

    // Find calls by program management parent
    @Query("SELECT c FROM CallEntry c WHERE c.programManagementParent.id = :parentId ORDER BY c.startTime DESC")
    List<CallEntry> findByProgramManagementParentOrderByStartTimeDesc(@Param("parentId") UUID parentId);

    // Find calls by category
    @Query("SELECT c FROM CallEntry c WHERE c.category.id = :categoryId ORDER BY c.startTime DESC")
    List<CallEntry> findByCategoryOrderByStartTimeDesc(@Param("categoryId") UUID categoryId);

    // Find calls by subject
    @Query("SELECT c FROM CallEntry c WHERE c.subject.id = :subjectId ORDER BY c.startTime DESC")
    List<CallEntry> findBySubjectOrderByStartTimeDesc(@Param("subjectId") UUID subjectId);

    // Complex query for reporting - calls by user, program, category and date range
    @Query("SELECT c FROM CallEntry c WHERE " +
           "(:email IS NULL OR c.datatechEmail = :email) AND " +
           "(:programParentId IS NULL OR c.programManagementParent.id = :programParentId) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR c.startTime >= :startDate) AND " +
           "(:endDate IS NULL OR c.startTime <= :endDate) " +
           "ORDER BY c.startTime DESC")
    Page<CallEntry> findWithFilters(@Param("email") String datatechEmail,
                                   @Param("programParentId") UUID programParentId,
                                   @Param("categoryId") UUID categoryId,
                                   @Param("startDate") OffsetDateTime startDate,
                                   @Param("endDate") OffsetDateTime endDate,
                                   Pageable pageable);

    // Count calls by user
    long countByDatatechEmail(String datatechEmail);

    // Count calls within date range
    @Query("SELECT COUNT(c) FROM CallEntry c WHERE c.startTime BETWEEN :startDate AND :endDate")
    long countByDateRange(@Param("startDate") OffsetDateTime startDate, 
                         @Param("endDate") OffsetDateTime endDate);

    // Count calls by boolean filters for reporting
    @Query("SELECT COUNT(c) FROM CallEntry c WHERE " +
           "(:isInbound IS NULL OR c.isInbound = :isInbound) AND " +
           "(:isAgent IS NULL OR c.isAgent = :isAgent)")
    long countByBooleanFilters(@Param("isInbound") Boolean isInbound, 
                              @Param("isAgent") Boolean isAgent);

    // Find calls by inbound/outbound status
    List<CallEntry> findByIsInboundOrderByStartTimeDesc(Boolean isInbound);

    // Find calls by agent status
    List<CallEntry> findByIsAgentOrderByStartTimeDesc(Boolean isAgent);

    // Find recent calls for dashboard (last N days)
    @Query("SELECT c FROM CallEntry c WHERE c.startTime >= :cutoffDate ORDER BY c.startTime DESC")
    List<CallEntry> findRecentCalls(@Param("cutoffDate") OffsetDateTime cutoffDate, Pageable pageable);
}