package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks by status.
     *
     * @param status the task status to search for
     * @return list of tasks with the specified status
     */
    List<Task> findByStatus(Task.TaskStatus status);

    /**
     * Find all tasks by priority.
     *
     * @param priority the task priority to search for
     * @return list of tasks with the specified priority
     */
    List<Task> findByPriority(Task.TaskPriority priority);

    /**
     * Find all tasks by user.
     *
     * @param user the user to search tasks for
     * @return list of tasks assigned to the specified user
     */
    List<Task> findByUser(User user);

    /**
     * Find all tasks by user ID.
     *
     * @param userId the user ID to search tasks for
     * @return list of tasks assigned to the user with the specified ID
     */
    List<Task> findByUserId(Long userId);

    /**
     * Find all tasks by user ID and status.
     *
     * @param userId the user ID to search tasks for
     * @param status the task status to filter by
     * @return list of tasks with the specified status for the user
     */
    List<Task> findByUserIdAndStatus(Long userId, Task.TaskStatus status);

    /**
     * Find all tasks by user ID and priority.
     *
     * @param userId the user ID to search tasks for
     * @param priority the task priority to filter by
     * @return list of tasks with the specified priority for the user
     */
    List<Task> findByUserIdAndPriority(Long userId, Task.TaskPriority priority);

    /**
     * Find all tasks by user ID and due date.
     *
     * @param userId the user ID to search tasks for
     * @param dueDate the due date to filter by
     * @return list of tasks with the specified due date for the user
     */
    List<Task> findByUserIdAndDueDate(Long userId, LocalDateTime dueDate);

    /**
     * Find all tasks by user ID with due date before the specified date.
     *
     * @param userId the user ID to search tasks for
     * @param dueDate the due date to filter by
     * @return list of tasks with due date before the specified date for the user
     */
    List<Task> findByUserIdAndDueDateBefore(Long userId, LocalDateTime dueDate);

    /**
     * Find all tasks by user ID with due date after the specified date.
     *
     * @param userId the user ID to search tasks for
     * @param dueDate the due date to filter by
     * @return list of tasks with due date after the specified date for the user
     */
    List<Task> findByUserIdAndDueDateAfter(Long userId, LocalDateTime dueDate);

    /**
     * Find all tasks for a user with pagination.
     *
     * @param userId the user ID to search tasks for
     * @param pageable the pagination parameters
     * @return page of tasks for the user
     */
    Page<Task> findByUserId(Long userId, Pageable pageable);

    /**
     * Find all tasks for a user with status filter with pagination.
     *
     * @param userId the user ID to search tasks for
     * @param status the task status to filter by
     * @param pageable the pagination parameters
     * @return page of tasks with the specified status for the user
     */
    Page<Task> findByUserIdAndStatus(Long userId, Task.TaskStatus status, Pageable pageable);

    /**
     * Find all tasks for a user with priority filter with pagination.
     *
     * @param userId the user ID to search tasks for
     * @param priority the task priority to filter by
     * @param pageable the pagination parameters
     * @return page of tasks with the specified priority for the user
     */
    Page<Task> findByUserIdAndPriority(Long userId, Task.TaskPriority priority, Pageable pageable);
}
