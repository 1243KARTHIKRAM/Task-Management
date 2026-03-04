import { authService, type RegisterRequest } from '../services/authService';

export function renderSignupPage(container: HTMLElement, onSuccess: () => void, onNavigate: (page: 'login' | 'signup' | 'home') => void): void {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-4xl font-extrabold text-white tracking-tight">
            Create Account
          </h2>
          <p class="mt-2 text-sm text-indigo-100">
            Join us and start managing your tasks
          </p>
        </div>
        
        <div class="card mt-8 p-8">
          <form id="signup-form" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>
              <div class="mt-1">
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  autocomplete="name" 
                  required
                  minlength="2"
                  maxlength="100"
                  class="input-field"
                  placeholder="John Doe"
                >
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <div class="mt-1">
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autocomplete="email" 
                  required
                  class="input-field"
                  placeholder="you@example.com"
                >
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <div class="mt-1">
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autocomplete="new-password" 
                  required
                  minlength="6"
                  maxlength="100"
                  class="input-field"
                  placeholder="••••••••"
                >
              </div>
              <p class="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm Password
              </label>
              <div class="mt-1">
                <input 
                  id="confirm-password" 
                  name="confirm-password" 
                  type="password" 
                  autocomplete="new-password" 
                  required
                  minlength="6"
                  maxlength="100"
                  class="input-field"
                  placeholder="••••••••"
                >
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
              </div>
              <div class="ml-2 text-sm">
                <label for="terms" class="font-medium text-gray-700 dark:text-gray-300">
                  I agree to the
                </label>
                <a href="#" class="text-indigo-600 hover:text-indigo-500"> Terms of Service</a>
                <span class="text-gray-500">and</span>
                <a href="#" class="text-indigo-600 hover:text-indigo-500"> Privacy Policy</a>
              </div>
            </div>

            <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
            <div id="success-message" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"></div>

            <div>
              <button 
                type="submit" 
                id="submit-btn"
                class="btn-primary"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </span>
                Create Account
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Or
                </span>
              </div>
            </div>

            <div class="mt-6">
              <button 
                id="login-btn"
                class="btn-secondary"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const form = document.getElementById('signup-form') as HTMLFormElement;
  const errorMessage = document.getElementById('error-message') as HTMLDivElement;
  const successMessage = document.getElementById('success-message') as HTMLDivElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

    // Reset messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    // Validate password match
    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match. Please try again.';
      errorMessage.classList.remove('hidden');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters long.';
      errorMessage.classList.remove('hidden');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Creating account...
    `;

    try {
      const registerData: RegisterRequest = { name, email, password };
      await authService.register(registerData);
      successMessage.textContent = 'Account created successfully! Redirecting...';
      successMessage.classList.remove('hidden');
      
      // Small delay before redirect
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      errorMessage.textContent = error.response?.data?.message || 'Registration failed. Please try again.';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        </span>
        Create Account
      `;
    }
  });

  loginBtn.addEventListener('click', () => {
    onNavigate('login');
  });
}
