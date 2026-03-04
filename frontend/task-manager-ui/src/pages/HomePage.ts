import { authService } from '../services/authService';
import { taskService, type TaskStats, type Task, type TaskRequest, type TaskStatus, type TaskPriority } from '../services/taskService';

export function renderHomePage(container: HTMLElement, onNavigate: (page: 'login' | 'signup' | 'home') => void): void {
  const user = authService.getUser();
  
  // State for tasks and filters
  let allTasks: Task[] = [];
  let filteredTasks: Task[] = [];
  let currentStatusFilter: TaskStatus | '' = '';
  let currentPriorityFilter: TaskPriority | '' = '';
  let currentSearchQuery: string = '';
  let currentDueDateFilter: string = '';
  let editingTask: Task | null = null;
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  container.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation Bar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-indigo-600">Task Manager</h1>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-indigo-600 font-medium">${user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span class="text-sm text-gray-700">${user?.name || 'User'}</span>
              </div>
              <button 
                id="logout-btn"
                class="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Dashboard Header -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p class="text-sm text-gray-500 mt-1">Manage your tasks</p>
          </div>

          <!-- Stats Cards Grid -->
          <div id="stats-container" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <!-- Loading State -->
            <div class="col-span-full flex justify-center py-12">
              <div class="animate-pulse flex flex-col items-center">
                <div class="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div class="text-sm text-gray-400">Loading stats...</div>
              </div>
            </div>
          </div>

          <!-- Task List Section -->
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Filters Sidebar -->
            <aside class="w-full lg:w-64 flex-shrink-0">
              <div class="bg-white rounded-lg shadow p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">Filters</h3>
                  <button id="clear-filters-btn" class="text-sm text-indigo-600 hover:text-indigo-800">Clear all</button>
                </div>

                <!-- Search -->
                <div class="mb-6">
                  <label for="search-input" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      id="search-input" 
                      class="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search tasks..."
                    >
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Status Filter -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" name="status-filter" value="" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" checked>
                      <span class="ml-2 text-sm text-gray-600">All</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="status-filter" value="PENDING" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Pending</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="status-filter" value="IN_PROGRESS" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">In Progress</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="status-filter" value="COMPLETED" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Completed</span>
                    </label>
                  </div>
                </div>

                <!-- Priority Filter -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" name="priority-filter" value="" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" checked>
                      <span class="ml-2 text-sm text-gray-600">All</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="priority-filter" value="LOW" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Low</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="priority-filter" value="MEDIUM" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Medium</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="priority-filter" value="HIGH" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">High</span>
                    </label>
                  </div>
                </div>

                <!-- Due Date Filter -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" name="due-date-filter" value="" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" checked>
                      <span class="ml-2 text-sm text-gray-600">Any</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="due-date-filter" value="overdue" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Overdue</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="due-date-filter" value="today" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Due Today</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="due-date-filter" value="this_week" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">Due This Week</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="due-date-filter" value="no_date" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                      <span class="ml-2 text-sm text-gray-600">No Due Date</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Task List -->
            <div class="flex-1">
              <div class="bg-white rounded-lg shadow">
                <!-- Task List Header -->
                <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-medium text-gray-900">Tasks</h3>
                    <span id="task-count" class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">0</span>
                  </div>
                  
                  <!-- New Task Button -->
                  <button
                    id="new-task-btn"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    New Task
                  </button>
                </div>

                <!-- Task List Container -->
                <div id="task-list-container" class="divide-y divide-gray-200">
                  <div class="p-8 text-center text-gray-500">Loading tasks...</div>
                </div>
              </div>
            </div>
          </div>
              
              <div class="flex flex-col sm:flex-row gap-3">
                <!-- Status Dropdown -->
                <div class="relative">
                  <select 
                    id="status-filter"
                    class="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <!-- Priority Dropdown -->
                <div class="relative">
                  <select 
                    id="priority-filter"
                    class="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <!-- New Task Button -->
                <button
                  id="new-task-btn"
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  New Task
                </button>
              </div>
            </div>

            <!-- Task List -->
            <div id="task-list-container" class="divide-y divide-gray-200">
              <div class="p-8 text-center text-gray-500">Loading tasks...</div>
            </div>
          </div>
        </div>
      </main>

      <!-- Create/Edit Task Modal -->
      <div id="task-modal" class="fixed inset-0 z-50 hidden">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div id="modal-overlay" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="absolute top-4 right-4">
              <button id="close-modal-btn" type="button" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 id="modal-title" class="text-lg leading-6 font-medium text-gray-900">Create New Task</h3>
                <div class="mt-4 space-y-4">
                  <!-- Title -->
                  <div>
                    <label for="task-title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input 
                      type="text" 
                      id="task-title" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter task title"
                    >
                  </div>

                  <!-- Description -->
                  <div>
                    <label for="task-description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                      id="task-description" 
                      rows="3"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <!-- Status -->
                  <div>
                    <label for="task-status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select 
                      id="task-status" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <!-- Priority -->
                  <div>
                    <label for="task-priority" class="block text-sm font-medium text-gray-700">Priority</label>
                    <select 
                      id="task-priority" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <!-- Due Date -->
                  <div>
                    <label for="task-due-date" class="block text-sm font-medium text-gray-700">Due Date</label>
                    <input 
                      type="date" 
                      id="task-due-date" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button 
                id="save-task-btn"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button 
                id="cancel-modal-btn"
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="delete-modal" class="fixed inset-0 z-50 hidden">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div id="delete-modal-overlay" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Task</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Are you sure you want to delete this task? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button 
                id="confirm-delete-btn"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button 
                id="cancel-delete-btn"
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize event listeners
  initializeEventListeners();

  // Load initial data
  loadStats();
  loadTasks();

  function initializeEventListeners(): void {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
      authService.logout();
      onNavigate('login');
    });

    // New task button
    const newTaskBtn = document.getElementById('new-task-btn');
    newTaskBtn?.addEventListener('click', () => openModal());

    // Search input with debounce
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      // Clear existing debounce timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      // Set new debounce timer (300ms delay)
      searchDebounceTimer = setTimeout(() => {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        applyFilters();
      }, 300);
    });

    // Status filter radio buttons
    const statusFilters = document.querySelectorAll('input[name="status-filter"]');
    statusFilters.forEach(filter => {
      filter.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        currentStatusFilter = target.value as TaskStatus | '';
        applyFilters();
      });
    });

    // Priority filter radio buttons
    const priorityFilters = document.querySelectorAll('input[name="priority-filter"]');
    priorityFilters.forEach(filter => {
      filter.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        currentPriorityFilter = target.value as TaskPriority | '';
        applyFilters();
      });
    });

    // Due date filter radio buttons
    const dueDateFilters = document.querySelectorAll('input[name="due-date-filter"]');
    dueDateFilters.forEach(filter => {
      filter.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        currentDueDateFilter = target.value;
        applyFilters();
      });
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    clearFiltersBtn?.addEventListener('click', () => {
      currentStatusFilter = '';
      currentPriorityFilter = '';
      currentSearchQuery = '';
      currentDueDateFilter = '';
      
      // Reset search input
      const searchInput = document.getElementById('search-input') as HTMLInputElement;
      if (searchInput) searchInput.value = '';
      
      // Reset all radio buttons
      const allRadios = document.querySelectorAll('input[type="radio"]');
      allRadios.forEach(radio => {
        const input = radio as HTMLInputElement;
        if (input.value === '') {
          input.checked = true;
        }
      });
      
      applyFilters();
    });

    // Modal controls
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const saveTaskBtn = document.getElementById('save-task-btn');

    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    saveTaskBtn?.addEventListener('click', saveTask);

    // Delete modal controls
    const deleteModalOverlay = document.getElementById('delete-modal-overlay');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    deleteModalOverlay?.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn?.addEventListener('click', confirmDelete);
  }

  async function loadStats(): Promise<void> {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    try {
      const stats = await taskService.getTaskStats();
      renderStatsCards(statsContainer, stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      statsContainer.innerHTML = `
        <div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p class="text-red-600 text-sm">Failed to load stats. Make sure the backend is running.</p>
        </div>
      `;
    }
  }

  async function loadTasks(): Promise<void> {
    const taskListContainer = document.getElementById('task-list-container');
    if (!taskListContainer) return;

    try {
      allTasks = await taskService.getAllTasks();
      applyFilters();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      taskListContainer.innerHTML = `
        <div class="p-8 text-center text-red-500">Failed to load tasks. Make sure the backend is running.</div>
      `;
    }
  }

  function applyFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    filteredTasks = allTasks.filter(task => {
      // Status filter
      const statusMatch = !currentStatusFilter || task.status === currentStatusFilter;
      
      // Priority filter
      const priorityMatch = !currentPriorityFilter || task.priority === currentPriorityFilter;
      
      // Search filter
      const searchMatch = !currentSearchQuery || 
        task.title.toLowerCase().includes(currentSearchQuery) ||
        (task.description && task.description.toLowerCase().includes(currentSearchQuery));
      
      // Due date filter
      let dueDateMatch = true;
      if (currentDueDateFilter) {
        if (currentDueDateFilter === 'no_date') {
          dueDateMatch = !task.dueDate;
        } else if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          switch (currentDueDateFilter) {
            case 'overdue':
              dueDateMatch = dueDate < today && task.status !== 'COMPLETED';
              break;
            case 'today':
              dueDateMatch = dueDate.getTime() === today.getTime();
              break;
            case 'this_week':
              dueDateMatch = dueDate >= today && dueDate <= endOfWeek;
              break;
          }
        } else {
          dueDateMatch = false;
        }
      }
      
      return statusMatch && priorityMatch && searchMatch && dueDateMatch;
    });
    
    // Update task count
    const taskCountElement = document.getElementById('task-count');
    if (taskCountElement) {
      taskCountElement.textContent = filteredTasks.length.toString();
    }
    
    renderTaskList();
  }

  function renderTaskList(): void {
    const taskListContainer = document.getElementById('task-list-container');
    if (!taskListContainer) return;

    if (filteredTasks.length === 0) {
      taskListContainer.innerHTML = `
        <div class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
        </div>
      `;
      return;
    }

    taskListContainer.innerHTML = filteredTasks.map(task => `
      <div class="p-4 hover:bg-gray-50 transition-colors" data-task-id="${task.id}">
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-1 min-w-0">
            <div class="flex-shrink-0">
              <button class="task-checkbox" data-task-id="${task.id}" data-status="${task.status}">
                ${getCheckboxIcon(task.status)}
              </button>
            </div>
            <div class="ml-4 flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900 truncate ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}">${escapeHtml(task.title)}</p>
                ${getStatusBadge(task.status)}
                ${getPriorityBadge(task.priority)}
              </div>
              ${task.description ? `<p class="text-sm text-gray-500 truncate mt-1">${escapeHtml(task.description)}</p>` : ''}
              ${task.dueDate ? `
                <div class="flex items-center gap-1 mt-2 text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-500'}">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>${formatDate(task.dueDate)}</span>
                  ${isOverdue(task.dueDate, task.status) ? '<span class="font-medium">(Overdue)</span>' : ''}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="ml-4 flex items-center gap-2">
            <button class="edit-task-btn text-gray-400 hover:text-indigo-600 p-1" data-task-id="${task.id}">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="delete-task-btn text-gray-400 hover:text-red-600 p-1" data-task-id="${task.id}">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners to task items
    document.querySelectorAll('.task-checkbox').forEach(btn => {
      btn.addEventListener('click', handleStatusToggle);
    });

    document.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt((e.currentTarget as HTMLElement).dataset.taskId || '0');
        openModal(taskId);
      });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt((e.currentTarget as HTMLElement).dataset.taskId || '0');
        openDeleteModal(taskId);
      });
    });
  }

  function getCheckboxIcon(status: TaskStatus): string {
    if (status === 'COMPLETED') {
      return `
        <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      `;
    }
    return `
      <svg class="h-5 w-5 text-gray-300 hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;
  }

  function getStatusBadge(status: TaskStatus): string {
    const styles: Record<TaskStatus, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    const labels: Record<TaskStatus, string> = {
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed'
    };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}">${labels[status]}</span>`;
  }

  function getPriorityBadge(priority: TaskPriority): string {
    const styles: Record<TaskPriority, string> = {
      'LOW': 'bg-gray-100 text-gray-800',
      'MEDIUM': 'bg-orange-100 text-orange-800',
      'HIGH': 'bg-red-100 text-red-800'
    };
    const labels: Record<TaskPriority, string> = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High'
    };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}">${labels[priority]}</span>`;
  }

  function isOverdue(dueDate: string, status: TaskStatus): boolean {
    if (status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function openModal(taskId?: number): void {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const titleInput = document.getElementById('task-title') as HTMLInputElement;
    const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
    const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
    const prioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
    const dueDateInput = document.getElementById('task-due-date') as HTMLInputElement;

    if (taskId) {
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        editingTask = task;
        modalTitle!.textContent = 'Edit Task';
        titleInput.value = task.title;
        descriptionInput.value = task.description;
        statusSelect.value = task.status;
        prioritySelect.value = task.priority;
        dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';
      }
    } else {
      editingTask = null;
      modalTitle!.textContent = 'Create New Task';
      titleInput.value = '';
      descriptionInput.value = '';
      statusSelect.value = 'PENDING';
      prioritySelect.value = 'MEDIUM';
      dueDateInput.value = '';
    }

    modal?.classList.remove('hidden');
    editingTask = null;
  }

  function closeModal(): void {
    const modal = document.getElementById('task-modal');
    modal?.classList.add('hidden');
    editingTask = null;
  }

  async function saveTask(): Promise<void> {
    const titleInput = document.getElementById('task-title') as HTMLInputElement;
    const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
    const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
    const prioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
    const dueDateInput = document.getElementById('task-due-date') as HTMLInputElement;

    const title = titleInput.value.trim();
    if (!title) {
      alert('Please enter a task title');
      return;
    }

    const taskRequest: TaskRequest = {
      title,
      description: descriptionInput.value.trim(),
      status: statusSelect.value as TaskStatus,
      priority: prioritySelect.value as TaskPriority,
      dueDate: dueDateInput.value ? `${dueDateInput.value} 00:00:00` : null
    };

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskRequest);
      } else {
        await taskService.createTask(taskRequest);
      }
      closeModal();
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  }

  let taskToDelete: number | null = null;

  function openDeleteModal(taskId: number): void {
    taskToDelete = taskId;
    const modal = document.getElementById('delete-modal');
    modal?.classList.remove('hidden');
  }

  function closeDeleteModal(): void {
    const modal = document.getElementById('delete-modal');
    modal?.classList.add('hidden');
    taskToDelete = null;
  }

  async function confirmDelete(): Promise<void> {
    if (!taskToDelete) return;

    try {
      await taskService.deleteTask(taskToDelete);
      closeDeleteModal();
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  }

  async function handleStatusToggle(e: Event): Promise<void> {
    const button = e.currentTarget as HTMLElement;
    const taskId = parseInt(button.dataset.taskId || '0');
    const currentStatus = button.dataset.status as TaskStatus;

    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus: TaskStatus;
    if (currentStatus === 'COMPLETED') {
      newStatus = 'PENDING';
    } else {
      newStatus = 'COMPLETED';
    }

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  }

  function renderStatsCards(container: HTMLElement, stats: TaskStats): void {
    const completionRate = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;

    container.innerHTML = `
      <!-- Total Tasks Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-indigo-50 p-3">
                <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.total}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">All tasks</span>
          </div>
        </div>
      </div>

      <!-- Pending Tasks Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-yellow-50 p-3">
                <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.pending}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">Awaiting action</span>
          </div>
        </div>
      </div>

      <!-- In Progress Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-blue-50 p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.inProgress}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">Currently working on</span>
          </div>
        </div>
      </div>

      <!-- Completed Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-green-50 p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.completed}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">${completionRate}% completion rate</span>
          </div>
        </div>
      </div>

      <!-- High Priority Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-red-50 p-3">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">High Priority</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.highPriority}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">Urgent tasks</span>
          </div>
        </div>
      </div>

      <!-- Overdue Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-orange-50 p-3">
                <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                <dd>
                  <div class="text-2xl font-semibold text-gray-900">${stats.overdue}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-500">Past due date</span>
          </div>
        </div>
      </div>
    `;
  }
}
