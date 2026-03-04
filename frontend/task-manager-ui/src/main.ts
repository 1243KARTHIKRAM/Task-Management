import './style.css'
import { authService } from './services/authService';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignupPage } from './pages/SignupPage';
import { renderHomePage } from './pages/HomePage';

type Page = 'login' | 'signup' | 'home';

function getCurrentPage(): Page {
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return 'home';
  }
  
  // Check URL hash for page
  const hash = window.location.hash.slice(1) as Page;
  if (hash === 'signup') return 'signup';
  return 'login';
}

function navigateTo(page: Page): void {
  window.location.hash = page;
}

function renderPage(page: Page): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  switch (page) {
    case 'login':
      renderLoginPage(app, () => navigateTo('home'), navigateTo);
      break;
    case 'signup':
      renderSignupPage(app, () => navigateTo('home'), navigateTo);
      break;
    case 'home':
      renderHomePage(app, navigateTo);
      break;
  }
}

function handleRoute(): void {
  const page = getCurrentPage();
  renderPage(page);
}

// Initial render
handleRoute();

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);
