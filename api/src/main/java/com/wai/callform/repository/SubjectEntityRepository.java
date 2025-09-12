package com.wai.callform.repository;

import com.wai.callform.entity.SubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for SubjectEntity operations.
 * Provides CRUD operations and custom queries for subjects.
 */
@Repository
public interface SubjectEntityRepository extends JpaRepository<SubjectEntity, UUID> {

    // Find all active subjects ordered by sort order and name
    List<SubjectEntity> findByIsActiveTrueOrderBySortOrderAscNameAsc();

    // Find all subjects (including inactive) ordered by sort order and name
    List<SubjectEntity> findAllByOrderBySortOrderAscNameAsc();

    // Find subject by exact name (case-insensitive)
    @Query("SELECT s FROM SubjectEntity s WHERE LOWER(s.name) = LOWER(:name)")
    Optional<SubjectEntity> findByNameIgnoreCase(@Param("name") String name);

    // Find subjects by partial name match (case-insensitive)
    @Query("SELECT s FROM SubjectEntity s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) AND s.isActive = true ORDER BY s.sortOrder ASC, s.name ASC")
    List<SubjectEntity> findByNameContainingIgnoreCase(@Param("name") String name);

    // Check if subject name exists (for uniqueness validation)
    @Query("SELECT COUNT(s) > 0 FROM SubjectEntity s WHERE LOWER(s.name) = LOWER(:name) AND s.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") UUID excludeId);

    // Check if subject name exists (for creation validation)
    @Query("SELECT COUNT(s) > 0 FROM SubjectEntity s WHERE LOWER(s.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);

    // Find the maximum sort order for new item placement
    @Query("SELECT COALESCE(MAX(s.sortOrder), 0) FROM SubjectEntity s")
    Integer findMaxSortOrder();

    // Find subjects for a specific task
    @Query("SELECT s FROM SubjectEntity s JOIN s.tasks t WHERE t.id = :taskId AND s.isActive = true ORDER BY s.sortOrder ASC, s.name ASC")
    List<SubjectEntity> findByTaskId(@Param("taskId") UUID taskId);

    // Find subjects that are not associated with any task
    @Query("SELECT s FROM SubjectEntity s WHERE s.isActive = true AND SIZE(s.tasks) = 0 ORDER BY s.sortOrder ASC, s.name ASC")
    List<SubjectEntity> findUnassignedSubjects();

    // Find subjects associated with multiple tasks
    @Query("SELECT s FROM SubjectEntity s WHERE s.isActive = true AND SIZE(s.tasks) > 1 ORDER BY s.sortOrder ASC, s.name ASC")
    List<SubjectEntity> findSubjectsWithMultipleTasks();

    // Load subject with tasks eagerly
    @Query("SELECT s FROM SubjectEntity s LEFT JOIN FETCH s.tasks WHERE s.id = :subjectId")
    Optional<SubjectEntity> findByIdWithTasks(@Param("subjectId") UUID subjectId);

    // Count active subjects
    long countByIsActiveTrue();

    // Count subjects for a specific task
    @Query("SELECT COUNT(s) FROM SubjectEntity s JOIN s.tasks t WHERE t.id = :taskId AND s.isActive = true")
    long countByTaskId(@Param("taskId") UUID taskId);
}