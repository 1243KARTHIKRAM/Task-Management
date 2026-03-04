/**
 * Reusable Pagination Component
 * 
 * A flexible pagination component that supports various configurations
 * and works with any data source. Designed for use with paged API responses.
 */

export interface PaginationInfo {
  /** Current page number (0-based) */
  page: number;
  /** Number of items per page */
  size: number;
  /** Total number of items available */
  totalElements: number;
  /** Total number of pages available */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** Whether this is the first page */
  isFirst: boolean;
  /** Whether this is the last page */
  isLast: boolean;
}

export interface PaginationOptions {
  /** Maximum number of page buttons to show (default: 5) */
  maxPageButtons?: number;
  /** Whether to show "First" and "Last" buttons (default: true) */
  showFirstLast?: boolean;
  /** Whether to show page size selector (default: true) */
  showPageSize?: boolean;
  /** Available page size options (default: [5, 10, 20, 50]) */
  pageSizeOptions?: number[];
  /** Custom class name for the container */
  className?: string;
  /** Text for "Previous" button (default: "Previous") */
  previousText?: string;
  /** Text for "Next" button (default: "Next") */
  nextText?: string;
  /** Text for "First" button (default: "First") */
  firstText?: string;
  /** Text for "Last" button (default: "Last") */
  lastText?: string;
  /** Text for "Showing X-Y of Z" (default: "Showing {start}-{end} of {total}") */
  showingText?: string;
}

export interface PaginationCallbacks {
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Called when page size changes */
  onPageSizeChange?: (size: number) => void;
}

/**
 * Calculates the page numbers to display in the pagination component
 */
function calculatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxPageButtons: number
): (number | string)[] {
  const pages: (number | string)[] = [];
  
  if (totalPages <= maxPageButtons) {
    // Show all pages if total pages is less than max page buttons
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate start and end pages
    let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    
    // Adjust if endPage exceeds totalPages
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 0) {
      pages.push(0);
      if (startPage > 1) {
        pages.push('...');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages - 1);
    }
  }
  
  return pages;
}

/**
 * Renders a reusable pagination component
 * 
 * @param container - The container element to render the pagination into
 * @param paginationInfo - Current pagination state from API
 * @param callbacks - Callbacks for page and page size changes
 * @param options - Optional configuration options
 * 
 * @example
 * ```typescript
 * const paginationInfo: PaginationInfo = {
 *   page: 0,
 *   size: 10,
 *   totalElements: 100,
 *   totalPages: 10,
 *   hasNext: true,
 *   hasPrevious: false,
 *   isFirst: true,
 *   isLast: false
 * };
 * 
 * renderPagination(
 *   document.getElementById('pagination')!,
 *   paginationInfo,
 *   {
 *     onPageChange: (page) => console.log('Page changed to:', page),
 *     onPageSizeChange: (size) => console.log('Page size changed to:', size)
 *   }
 * );
 * ```
 */
export function renderPagination(
  container: HTMLElement,
  paginationInfo: PaginationInfo,
  callbacks: PaginationCallbacks,
  options: PaginationOptions = {}
): void {
  const {
    maxPageButtons = 5,
    showFirstLast = true,
    showPageSize = true,
    pageSizeOptions = [5, 10, 20, 50],
    className = '',
    previousText = 'Previous',
    nextText = 'Next',
    firstText = 'First',
    lastText = 'Last',
    showingText = 'Showing {start}-{end} of {total}'
  } = options;

  const { page, size, totalElements, totalPages, hasNext, hasPrevious } = paginationInfo;
  
  // Calculate showing range
  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);
  
  // Handle edge case when there's no data
  if (totalElements === 0) {
    container.innerHTML = `
      <div class="pagination-container ${className}">
        <p class="text-sm text-gray-500">No items to display</p>
      </div>
    `;
    return;
  }

  // Calculate page numbers to display
  const pageNumbers = calculatePageNumbers(page, totalPages, maxPageButtons);

  // Build page size selector HTML
  const pageSizeSelectorHtml = showPageSize ? `
    <div class="flex items-center space-x-2 ml-4">
      <span class="text-sm text-gray-600">Rows per page:</span>
      <select 
        id="page-size-select" 
        class="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        ${pageSizeOptions.map(option => `
          <option value="${option}" ${option === size ? 'selected' : ''}>${option}</option>
        `).join('')}
      </select>
    </div>
  ` : '';

  // Build first/last buttons HTML
  const firstButtonHtml = showFirstLast && !paginationInfo.isFirst ? `
    <button 
      class="pagination-btn pagination-first-btn px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      data-page="0"
    >
      ${firstText}
    </button>
  ` : '';

  const lastButtonHtml = showFirstLast && !paginationInfo.isLast ? `
    <button 
      class="pagination-btn pagination-last-btn px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      data-page="${totalPages - 1}"
    >
      ${lastText}
    </button>
  ` : '';

  // Build page numbers HTML
  const pageNumbersHtml = pageNumbers.map(p => {
    if (p === '...') {
      return `<span class="px-2 py-1 text-gray-500">...</span>`;
    }
    const isActive = p === page;
    return `
      <button 
        class="pagination-btn pagination-page-btn px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isActive 
            ? 'bg-indigo-600 text-white border border-indigo-600' 
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
        }"
        data-page="${p}"
      >
        ${(p as number) + 1}
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div class="pagination-container flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}">
      <!-- Showing info -->
      <div class="text-sm text-gray-600 order-2 sm:order-1">
        ${showingText
          .replace('{start}', String(start))
          .replace('{end}', String(end))
          .replace('{total}', String(totalElements))}
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center space-x-2 order-1 sm:order-2">
        <!-- Page Size Selector -->
        ${pageSizeSelectorHtml}

        <!-- First Button -->
        ${firstButtonHtml}

        <!-- Previous Button -->
        <button 
          class="pagination-btn pagination-prev-btn px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            !hasPrevious ? 'opacity-50 cursor-not-allowed' : ''
          }"
          data-page="${page - 1}"
          ${!hasPrevious ? 'disabled' : ''}
        >
          ${previousText}
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          ${pageNumbersHtml}
        </div>

        <!-- Next Button -->
        <button 
          class="pagination-btn pagination-next-btn px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            !hasNext ? 'opacity-50 cursor-not-allowed' : ''
          }"
          data-page="${page + 1}"
          ${!hasNext ? 'disabled' : ''}
        >
          ${nextText}
        </button>

        <!-- Last Button -->
        ${lastButtonHtml}
      </div>
    </div>
  `;

  // Attach event listeners
  attachPaginationEvents(container, callbacks, showPageSize);
}

/**
 * Attaches event listeners to pagination buttons
 */
function attachPaginationEvents(
  container: HTMLElement,
  callbacks: PaginationCallbacks,
  showPageSize: boolean
): void {
  // Page button clicks
  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const page = target.dataset.page;
      
      if (page && !target.hasAttribute('disabled')) {
        callbacks.onPageChange(parseInt(page, 10));
      }
    });
  });

  // Page size selector
  if (showPageSize) {
    const pageSizeSelect = container.querySelector('#page-size-select') as HTMLSelectElement;
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        if (callbacks.onPageSizeChange) {
          callbacks.onPageSizeChange(parseInt(target.value, 10));
        }
      });
    }
  }
}

/**
 * Helper function to create a PaginationInfo object from API response
 * Use this to transform backend response to the format expected by the component
 * 
 * @example
 * ```typescript
 * const response = await axios.get('/api/tasks?page=0&size=10');
 * const paginationInfo = createPaginationInfo(response.data);
 * ```
 */
export function createPaginationInfo(apiResponse: {
  page?: number;
  number?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}): PaginationInfo {
  return {
    page: apiResponse.page ?? apiResponse.number ?? 0,
    size: apiResponse.size ?? 10,
    totalElements: apiResponse.totalElements ?? 0,
    totalPages: apiResponse.totalPages ?? 0,
    hasNext: apiResponse.hasNext ?? false,
    hasPrevious: apiResponse.hasPrevious ?? false,
    isFirst: apiResponse.isFirst ?? true,
    isLast: apiResponse.isLast ?? true
  };
}

/**
 * Creates default pagination info for initial state
 */
export function createDefaultPaginationInfo(): PaginationInfo {
  return {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    isFirst: true,
    isLast: true
  };
}
