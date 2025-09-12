package com.wai.callform.service;

import com.wai.callform.dto.SubjectEntityDto;
import com.wai.callform.dto.TaskEntityDto;
import com.wai.callform.entity.SubjectEntity;
import com.wai.callform.entity.TaskEntity;
import com.wai.callform.repository.SubjectEntityRepository;
import com.wai.callform.repository.TaskEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing Tasks and Subjects and their relationships.
 * Handles all business logic for task-subject operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskSubjectService {

    private final TaskEntityRepository taskRepository;
    private final SubjectEntityRepository subjectRepository;

    /**
     * Get all active tasks with their associated subjects.
     */
    public List<TaskEntityDto> getAllActiveTasks() {
        log.debug("Fetching all active tasks");
        List<TaskEntity> tasks = taskRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc();
        return tasks.stream()
                .map(this::convertToTaskDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all active subjects.
     */
    public List<SubjectEntityDto> getAllActiveSubjects() {
        log.debug("Fetching all active subjects");
        List<SubjectEntity> subjects = subjectRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc();
        return subjects.stream()
                .map(this::convertToSubjectDto)
                .collect(Collectors.toList());
    }

    /**
     * Get subjects for a specific task.
     */
    public List<SubjectEntityDto> getSubjectsForTask(UUID taskId) {
        log.debug("Fetching subjects for task: {}", taskId);
        
        // First verify the task exists
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
        
        // Get subjects for this task
        List<SubjectEntity> subjects = subjectRepository.findByTaskId(taskId);
        return subjects.stream()
                .map(this::convertToSubjectDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific task with its subjects.
     */
    public TaskEntityDto getTaskById(UUID taskId) {
        log.debug("Fetching task by id: {}", taskId);
        TaskEntity task = taskRepository.findByIdWithSubjects(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
        return convertToTaskDto(task);
    }

    /**
     * Check if a subject is valid for a given task.
     */
    public boolean isSubjectValidForTask(UUID taskId, UUID subjectId) {
        if (taskId == null || subjectId == null) {
            return false;
        }
        
        TaskEntity task = taskRepository.findByIdWithSubjects(taskId)
                .orElse(null);
        
        if (task == null) {
            return false;
        }
        
        // Check if the subject is in the task's subject set
        return task.getSubjects().stream()
                .anyMatch(subject -> subject.getId().equals(subjectId));
    }

    /**
     * Convert TaskEntity to TaskEntityDto.
     */
    private TaskEntityDto convertToTaskDto(TaskEntity task) {
        Set<TaskEntityDto.SubjectReferenceDto> subjectRefs = task.getSubjects().stream()
                .filter(SubjectEntity::getIsActive)
                .map(subject -> TaskEntityDto.SubjectReferenceDto.builder()
                        .id(subject.getId())
                        .name(subject.getName())
                        .sortOrder(subject.getSortOrder())
                        .build())
                .collect(Collectors.toSet());

        return TaskEntityDto.builder()
                .id(task.getId())
                .name(task.getName())
                .isActive(task.getIsActive())
                .sortOrder(task.getSortOrder())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .subjects(subjectRefs)
                .subjectCount(subjectRefs.size())
                .hasSubjects(!subjectRefs.isEmpty())
                .build();
    }

    /**
     * Convert SubjectEntity to SubjectEntityDto.
     */
    private SubjectEntityDto convertToSubjectDto(SubjectEntity subject) {
        Set<SubjectEntityDto.TaskReferenceDto> taskRefs = subject.getTasks().stream()
                .filter(TaskEntity::getIsActive)
                .map(task -> SubjectEntityDto.TaskReferenceDto.builder()
                        .id(task.getId())
                        .name(task.getName())
                        .sortOrder(task.getSortOrder())
                        .build())
                .collect(Collectors.toSet());

        return SubjectEntityDto.builder()
                .id(subject.getId())
                .name(subject.getName())
                .isActive(subject.getIsActive())
                .sortOrder(subject.getSortOrder())
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .tasks(taskRefs)
                .taskCount(taskRefs.size())
                .isAssignedToTasks(!taskRefs.isEmpty())
                .build();
    }

    /**
     * Create a new task.
     */
    @Transactional
    public TaskEntityDto createTask(String name, Integer sortOrder) {
        log.info("Creating new task: {}", name);
        
        // Check if name already exists
        if (taskRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Task with name already exists: " + name);
        }
        
        TaskEntity task = new TaskEntity();
        task.setName(name);
        task.setSortOrder(sortOrder != null ? sortOrder : taskRepository.findMaxSortOrder() + 10);
        task.setIsActive(true);
        
        task = taskRepository.save(task);
        return convertToTaskDto(task);
    }

    /**
     * Create a new subject.
     */
    @Transactional
    public SubjectEntityDto createSubject(String name, Integer sortOrder) {
        log.info("Creating new subject: {}", name);
        
        // Check if name already exists
        if (subjectRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Subject with name already exists: " + name);
        }
        
        SubjectEntity subject = new SubjectEntity();
        subject.setName(name);
        subject.setSortOrder(sortOrder != null ? sortOrder : subjectRepository.findMaxSortOrder() + 10);
        subject.setIsActive(true);
        
        subject = subjectRepository.save(subject);
        return convertToSubjectDto(subject);
    }
}