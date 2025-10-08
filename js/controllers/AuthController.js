// js/controllers/AuthController.js
(function () {
  const $ = (sel) => document.querySelector(sel);

  const loginView = $('#login-view');
  const dashboardView = $('#dashboard-view');
  const loginForm = $('#login-form');
  const loginMsg = $('#login-message');
  const logoutBtn = $('#logout-btn');

  function show(view) {
    // toggle high-level views only
    if (view === 'login') {
      loginView.classList.add('active');
      dashboardView.classList.remove('active');
    } else {
      dashboardView.classList.add('active');
      loginView.classList.remove('active');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    loginMsg.textContent = '';
    const username = (document.getElementById('username').value || '').trim();
    const password = document.getElementById('password').value || '';

    try {
      await ApiService.login(username, password);
      window.App = window.App || {};
      window.App.loggedIn = true;

      // after successful login, boot the app area
      show('dashboard');
      if (window.AppBoot && typeof window.AppBoot.afterLogin === 'function') {
        window.AppBoot.afterLogin();
      }
    } catch (err) {
      loginMsg.textContent = err?.message || 'Login failed';
      loginMsg.classList.add('error');
    }
  }

  async function handleLogout(e) {
    e?.preventDefault?.();

    try { await ApiService.logout(); } catch {}

    // Hard clear any app state that could re-trigger dashboard
    try {
      // remove only auth/token & ephemeral UI state
      localStorage.removeItem('myems.jwt');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch {}

    // mark app state
    window.App = window.App || {};
    window.App.loggedIn = false;

    // Show login view explicitly
    show('login');

    // Stop any intervals/listeners that were started after login
    if (window.AppBoot && typeof window.AppBoot.onLogout === 'function') {
      window.AppBoot.onLogout();
    }

    // Also remove hash to avoid route restoring
    if (location.hash) {
      history.replaceState({}, '', location.pathname);
    }
  }

  // wire events
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // expose for other controllers if needed
  window.AuthController = {
    showLogin: () => show('login'),
    showApp: () => show('dashboard'),
    logout: handleLogout,
  };
})();
