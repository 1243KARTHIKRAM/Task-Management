package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.PagedResponse;
import com.taskmanagement.backend.dto.TaskRequest;
import com.taskmanagement.backend.dto.TaskResponse;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.User;
import com.taskmanagement.backend.exception.ResourceNotFoundException;
import com.taskmanagement.backend.repository.TaskRepository;
import com.taskmanagement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Task management operations.
 * Handles business logic for creating, retrieving, updating, and deleting tasks.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new task for a user.
     *
     * @param taskRequest the task request containing task details
     * @param userId the ID of the user creating the task
     * @return the created task as TaskResponse
     */
    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Task task = Task.builder()
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
                .status(taskRequest.getStatus())
                .priority(taskRequest.getPriority())
                .dueDate(taskRequest.getDueDate())
                .user(user)
                .build();

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromTask(savedTask);
    }

    /**
     * Retrieves all tasks for a specific user.
     *
     * @param userId the ID of the user
     * @return list of tasks as TaskResponse
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByUser(Long userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        return tasks.stream()
                .map(TaskResponse::fromTask)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves tasks for a specific user with optional filters.
     *
     * @param userId the ID of the user
     * @param status optional status filter
     * @param priority optional priority filter
     * @param dueDate optional due date filter
     * @param dueDateBefore optional due date before filter
     * @param dueDateAfter optional due date after filter
     * @return list of tasks as TaskResponse matching the filters
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByUserWithFilters(
            Long userId,
            Task.TaskStatus status,
            Task.TaskPriority priority,
            LocalDateTime dueDate,
            LocalDateTime dueDateBefore,
            LocalDateTime dueDateAfter) {
        
        List<Task> tasks;
        
        // Apply filters based on provided parameters
        if (status != null && priority != null) {
            // If both status and priority are provided, we need to filter in memory
            tasks = taskRepository.findByUserId(userId);
            tasks = tasks.stream()
                    .filter(t -> t.getStatus() == status && t.getPriority() == priority)
                    .collect(Collectors.toList());
        } else if (status != null) {
            tasks = taskRepository.findByUserIdAndStatus(userId, status);
        } else if (priority != null) {
            tasks = taskRepository.findByUserIdAndPriority(userId, priority);
        } else {
            tasks = taskRepository.findByUserId(userId);
        }
        
        // Apply due date filters
        if (dueDate != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().equals(dueDate))
                    .collect(Collectors.toList());
        } else if (dueDateBefore != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(dueDateBefore))
                    .collect(Collectors.toList());
        } else if (dueDateAfter != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isAfter(dueDateAfter))
                    .collect(Collectors.toList());
        }
        
        return tasks.stream()
                .map(TaskResponse::fromTask)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a task by its ID.
     *
     * @param taskId the ID of the task
     * @return the task as TaskResponse
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return TaskResponse.fromTask(task);
    }

    /**
     * Updates an existing task.
     *
     * @param taskId the ID of the task to update
     * @param taskRequest the updated task details
     * @return the updated task as TaskResponse
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest taskRequest) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        task.setPriority(taskRequest.getPriority());
        task.setDueDate(taskRequest.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromTask(updatedTask);
    }

    /**
     * Deletes a task by its ID.
     *
     * @param taskId the ID of the task to delete
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        taskRepository.delete(task);
    }

    /**
     * Updates only the status of a task.
     *
     * @param taskId the ID of the task to update
     * @param status the new status
     * @return the updated task as TaskResponse
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public TaskResponse updateStatus(Long taskId, Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromTask(updatedTask);
    }

    /**
     * Gets a task entity by ID (for internal use).
     *
     * @param taskId the ID of the task
     * @return the Task entity
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional(readOnly = true)
    public Task getTaskEntityById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    }

    /**
     * Retrieves all tasks for a specific user with pagination.
     *
     * @param userId the ID of the user
     * @param pageable the pagination parameters
     * @return paged list of tasks as PagedResponse
     */
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksByUserPaged(Long userId, Pageable pageable) {
        Page<Task> taskPage = taskRepository.findByUserId(userId, pageable);
        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(TaskResponse::fromTask)
                .collect(Collectors.toList());
        
        return PagedResponse.<TaskResponse>builder()
                .content(taskResponses)
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .hasNext(taskPage.hasNext())
                .hasPrevious(taskPage.hasPrevious())
                .isFirst(taskPage.isFirst())
                .isLast(taskPage.isLast())
                .build();
    }

    /**
     * Retrieves tasks for a specific user with pagination and optional filters.
     *
     * @param userId the ID of the user
     * @param status optional status filter
     * @param priority optional priority filter
     * @param pageable the pagination parameters
     * @return paged list of tasks as PagedResponse
     */
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksByUserWithFiltersPaged(
            Long userId,
            Task.TaskStatus status,
            Task.TaskPriority priority,
            Pageable pageable) {
        
        Page<Task> taskPage;
        
        if (status != null && priority != null) {
            // If both status and priority are provided, use basic query and filter in memory
            taskPage = taskRepository.findByUserId(userId, pageable);
            List<Task> filteredTasks = taskPage.getContent().stream()
                    .filter(t -> t.getStatus() == status && t.getPriority() == priority)
                    .collect(Collectors.toList());
            
            // Create a simple Page implementation for filtered results
            final int start = (int) pageable.getOffset();
            final int end = Math.min((start + pageable.getPageSize()), filteredTasks.size());
            List<Task> pagedFiltered = start > filteredTasks.size() ? 
                    List.of() : filteredTasks.subList(start, end);
            
            List<TaskResponse> taskResponses = pagedFiltered.stream()
                    .map(TaskResponse::fromTask)
                    .collect(Collectors.toList());
            
            return PagedResponse.<TaskResponse>builder()
                    .content(taskResponses)
                    .page(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(filteredTasks.size())
                    .totalPages((int) Math.ceil((double) filteredTasks.size() / pageable.getPageSize()))
                    .hasNext(start + pageable.getPageSize() < filteredTasks.size())
                    .hasPrevious(pageable.getPageNumber() > 0)
                    .isFirst(pageable.getPageNumber() == 0)
                    .isLast(start + pageable.getPageSize() >= filteredTasks.size())
                    .build();
        } else if (status != null) {
            taskPage = taskRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (priority != null) {
            taskPage = taskRepository.findByUserIdAndPriority(userId, priority, pageable);
        } else {
            taskPage = taskRepository.findByUserId(userId, pageable);
        }
        
        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(TaskResponse::fromTask)
                .collect(Collectors.toList());
        
        return PagedResponse.<TaskResponse>builder()
                .content(taskResponses)
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .hasNext(taskPage.hasNext())
                .hasPrevious(taskPage.hasPrevious())
                .isFirst(taskPage.isFirst())
                .isLast(taskPage.isLast())
                .build();
    }
}
