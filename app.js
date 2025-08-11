// app.js  (copy/paste)
document.addEventListener('DOMContentLoaded', () => {
  /* ===== CONFIG: force backend origin, never the frontend ===== */
  const BACKEND_ORIGIN = 'https://bybit-backend-xeuv.onrender.com';
  let API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || BACKEND_ORIGIN;

  try {
    const u = new URL(API_URL);
    API_URL = `${u.protocol}//${u.host}`;
  } catch { API_URL = BACKEND_ORIGIN; }

  const FRONTEND_ORIGIN = `${location.protocol}//${location.host}`;
  if (API_URL === FRONTEND_ORIGIN) {
    console.warn('API_URL resolved to frontend; forcing backend.');
    API_URL = BACKEND_ORIGIN;
  }

  const buildURL = (p) => `${API_URL}${p.startsWith('/') ? '' : '/'}${p}`;

  /* ===== helpers ===== */
  const $ = (s) => document.querySelector(s);
  const setToken = (t) => { try { localStorage.setItem('token', t); } catch {} };
  const getToken = () => { try { return localStorage.getItem('token'); } catch { return null; } };

  async function jsonFetch(path, opts = {}) {
    const url = buildURL(path);
    console.log('[FETCH]', url); // <-- see exact endpoint in DevTools
    try {
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        headers: { Accept: 'application/json', ...(opts.headers || {}) },
        ...opts,
      });
      let data = {};
      try { data = await res.json(); } catch {}
      return { res, data, url };
    } catch (e) {
      alert('Network/CORS error. Check FRONTEND_ORIGINS on backend.');
      throw e;
    }
  }

  /* ===== SIGNUP ===== */
  const signupForm = $('#signup-form');
  const registerLoader = $('#registerLoader');
  const signupBtn = signupForm?.querySelector('button[type="submit"]');

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullname = signupForm.querySelector('input[name="fullname"]')?.value.trim();
    const email = signupForm.querySelector('input[name="email"]')?.value.trim().toLowerCase();
    const password = signupForm.querySelector('input[name="password"]')?.value;

    if (!fullname || !email || !password) return alert('❌ Please fill in all fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('❌ Invalid email.');
    if (password.length < 8) return alert('❌ Password must be at least 8 characters.');

    registerLoader && (registerLoader.style.display = 'block');
    signupBtn && (signupBtn.disabled = true);

    try {
      const { res, data, url } = await jsonFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      if (res.ok && data.token) {
        setToken(data.token);
        alert('✅ Signup successful!');
        location.href = 'dashboard.html';
      } else if (res.status === 409) {
        alert('❌ Email already in use. Please log in.');
        location.hash = '#login';
      } else if (res.status === 404) {
        alert('Endpoint not found on backend (404). Check API_URL and deploy.');
        console.error('404 URL was:', url); // <-- confirm where it went
      } else {
        alert(data.error || `Signup failed (status ${res.status}).`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Signup error. Try again.');
    } finally {
      registerLoader && (registerLoader.style.display = 'none');
      signupBtn && (signupBtn.disabled = false);
    }
  });

  /* ===== LOGIN (unchanged) ===== */
  const loginForm = $('#login-form');
  const loginLoader = $('#loginLoader');
  const loginBtn = loginForm?.querySelector('button[type="submit"]');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email')?.value.trim().toLowerCase();
    const password = $('#login-password')?.value;
    if (!email || !password) return alert('❌ Please enter email and password.');
    loginLoader && (loginLoader.style.display = 'block');
    loginBtn && (loginBtn.disabled = true);
    try {
      const { res, data } = await jsonFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok && data.token) {
        setToken(data.token);
        location.href = 'dashboard.html';
      } else {
        alert(data.error || `Login failed (status ${res.status}).`);
      }
    } finally {
      loginLoader && (loginLoader.style.display = 'none');
      loginBtn && (loginBtn.disabled = false);
    }
  });
});
