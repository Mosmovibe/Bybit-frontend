document.addEventListener('DOMContentLoaded', () => {
  /* ===================== CONFIG ===================== */
  // Prefer APP_CONFIG if you set it in HTML, else fall back to your backend.
  let API_URL =
    (window.APP_CONFIG && window.APP_CONFIG.API_URL) ||
    'https://bybit-backend-xeuv.onrender.com';

  // Normalize to origin (scheme://host[:port])
  try {
    const u = new URL(API_URL);
    API_URL = `${u.protocol}//${u.host}`;
  } catch {
    console.warn('API_URL is not a valid URL origin. Fix this if requests fail:', API_URL);
  }

  // Guard: never let API_URL equal the frontend origin (that causes 404s)
  if (API_URL === `${location.protocol}//${location.host}`) {
    console.warn('API_URL resolved to frontend origin; forcing backend origin.');
    API_URL = 'https://bybit-backend-xeuv.onrender.com';
  }

  const isDashboard = window.location.pathname.includes('dashboard.html');

  /* ===================== Token helpers ===================== */
  const getToken = () => {
    try {
      const t = localStorage.getItem('token');
      return (typeof t === 'string' && t.trim()) ? t : null;
    } catch {
      return null;
    }
  };
  const setToken = (t) => { try { localStorage.setItem('token', t); } catch {} };
  const clearToken = () => { try { localStorage.removeItem('token'); } catch {} };

  // Redirect to login if not authenticated on dashboard
  if (isDashboard && !getToken()) {
    window.location.href = 'index.html';
    return;
  }

  /* ===================== Small helpers ===================== */
  const $ = (s) => document.querySelector(s);
  const setText = (sel, v) => { const el = $(sel); if (el) el.textContent = v ?? ''; };
  const buildApi = (path) => `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const disable = (el, on) => { if (el) { el.disabled = !!on; el.style.opacity = on ? '0.7' : ''; } };

  // Centralized fetch that parses JSON and surfaces common CORS/network errors
  async function jsonFetch(path, opts = {}) {
    const url = buildApi(path);
    const base = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      headers: { Accept: 'application/json', ...(opts.headers || {}) },
      ...opts,
    };
    try {
      const res = await fetch(url, base);
      let data = {};
      try { data = await res.json(); } catch { /* may be empty/204 */ }
      return { res, data };
    } catch (e) {
      const err = new Error('Network/CORS error. Check FRONTEND_ORIGINS and API_URL.');
      err.cause = e;
      throw err;
    }
  }

  /* ===================== SIGNUP ===================== */
  const signupForm = document.getElementById('signup-form');
  const registerLoader = document.getElementById('registerLoader');
  const signupBtn = signupForm?.querySelector('button[type="submit"]');

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = signupForm.querySelector('input[name="fullname"]')?.value.trim();
    const email = signupForm.querySelector('input[name="email"]')?.value.trim().toLowerCase();
    const password = signupForm.querySelector('input[name="password"]')?.value;

    if (!fullname || !email || !password) return alert('❌ Please fill in all fields.');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return alert('❌ Invalid email format.');
    if (password.length < 8) return alert('❌ Password must be at least 8 characters.');

    try {
      if (registerLoader) registerLoader.style.display = 'block';
      disable(signupBtn, true);

      const { res, data } = await jsonFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      if (res.ok && data.token) {
        setToken(data.token);
        alert('✅ Signup successful!');
        window.location.href = 'dashboard.html';
      } else if (res.status === 409) {
        alert('❌ Email already in use. Please log in.');
        window.location.hash = '#login';
      } else if (res.status === 400) {
        alert(data.error || '❌ Invalid signup details.');
      } else if (res.status === 404) {
        alert('Endpoint not found on backend (404). Check API_URL and deploy.');
      } else {
        alert(data.error || `Signup failed (status ${res.status}).`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || '❌ Signup error. Try again.');
    } finally {
      if (registerLoader) registerLoader.style.display = 'none';
      disable(signupBtn, false);
    }
  });

  /* ===================== LOGIN ===================== */
  const loginForm = document.getElementById('login-form');
  const loginLoader = document.getElementById('loginLoader');
  const loginBtn = loginForm?.querySelector('button[type="submit"]');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email')?.value.trim().toLowerCase();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) return alert('❌ Please enter email and password.');
    if (loginLoader) loginLoader.style.display = 'block';
    disable(loginBtn, true);

    try {
      const { res, data } = await jsonFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok && data.token) {
        setToken(data.token);
        window.location.href = 'dashboard.html';
      } else if (res.status === 401) {
        alert('❌ Invalid credentials.');
      } else {
        alert(data.error || `Login failed (status ${res.status}).`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || '❌ Login failed. Try again.');
    } finally {
      if (loginLoader) loginLoader.style.display = 'none';
      disable(loginBtn, false);
    }
  });

  /* ===================== LOGOUT ===================== */
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-button');
  logoutBtn?.addEventListener('click', () => {
    clearToken();
    alert('✅ Logged out successfully');
    window.location.href = 'index.html';
  });

  /* ===================== PROFILE PIC UPLOAD ===================== */
  const profilePicInput = document.getElementById('uploadProfilePic');
  const uploadBtn = document.getElementById('uploadBtn');

  uploadBtn?.addEventListener('click', async () => {
    if (!profilePicInput) return alert('Profile picture input not found.');
    const file = profilePicInput.files?.[0];
    if (!file) return alert('Please choose a picture first.');

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const { res, data } = await jsonFetch('/api/upload-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }, // do NOT set Content-Type with FormData
        body: formData,
      });

      if (res.ok && data.profilePicUrl) {
        document.querySelectorAll('.user-image,#profilePic').forEach(img => {
          if (img) img.src = `${data.profilePicUrl}?t=${Date.now()}`;
        });
        alert('✅ Profile picture updated!');
      } else {
        alert(data.error || '❌ Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || '❌ Upload error. Try again.');
    }
  });

  /* ===================== DASHBOARD LOAD ===================== */
  let CURRENT_USER_ID = null;
  let IS_ADMIN = false;

  async function fetchDashboard() {
    if (!isDashboard) return;
    const token = getToken();
    if (!token) return;

    try {
      const { res, data } = await jsonFetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error(data.error || 'Failed to fetch dashboard data');
        if (res.status === 401 || res.status === 403) {
          alert('Session expired. Please log in again.');
          clearToken();
          window.location.href = 'index.html';
        }
        return;
      }

      CURRENT_USER_ID = data._id || null;
      IS_ADMIN = !!data.isAdmin;

      setText('#fullName', data.fullname || 'N/A');
      setText('.plan-value', data.investmentPlan || data.package || 'N/A');
      setText('.amount-value', data.amountInvested ? Number(data.amountInvested).toLocaleString() : '0');
      if (data.profilePic && document.getElementById('profilePic')) {
        document.getElementById('profilePic').src = `${data.profilePic}?t=${Date.now()}`;
      }

      const planInput = document.getElementById('planInput');
      const amountInput = document.getElementById('amountInput');
      if (planInput) planInput.value = data.investmentPlan || 'Free';
      if (amountInput) amountInput.value = Number(data.amountInvested || 0);

      const updateSection = document.getElementById('updateSection');
      if (updateSection) updateSection.style.display = IS_ADMIN ? 'block' : 'none';
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  }
  fetchDashboard();

  /* ===================== ADMIN: UPDATE PLAN/AMOUNT ===================== */
  const savePlanBtn = document.getElementById('savePlanBtn');
  const updateMsg = document.getElementById('updateMsg');

  savePlanBtn?.addEventListener('click', async () => {
    if (!IS_ADMIN) {
      if (updateMsg) { updateMsg.textContent = 'Admin only.'; updateMsg.style.color = 'red'; }
      return;
    }
    if (!CURRENT_USER_ID) {
      if (updateMsg) { updateMsg.textContent = 'No user id found.'; updateMsg.style.color = 'red'; }
      return;
    }
    const plan = (document.getElementById('planInput')?.value || '').trim();
    const amountStr = document.getElementById('amountInput')?.value;
    const amount = Number(amountStr);

    if (!plan) { updateMsg.textContent = 'Please enter a plan.'; updateMsg.style.color = 'red'; return; }
    if (!Number.isFinite(amount)) { updateMsg.textContent = 'Amount must be a number.'; updateMsg.style.color = 'red'; return; }

    updateMsg.textContent = 'Saving…'; updateMsg.style.color = '';

    try {
      const { res, data } = await jsonFetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ userId: CURRENT_USER_ID, investmentPlan: plan, amountInvested: amount }),
      });

      if (!res.ok) throw new Error(data.error || 'Update failed');

      setText('.plan-value', data.user?.investmentPlan ?? plan);
      setText('.amount-value', Number(data.user?.amountInvested ?? amount).toLocaleString());

      updateMsg.textContent = 'Updated!'; updateMsg.style.color = 'green';
    } catch (e) {
      console.error('Admin update failed:', e);
      updateMsg.textContent = e.message || 'Update failed.'; updateMsg.style.color = 'red';
    }
  });

  /* ===================== ADMIN: EDIT BALANCE ===================== */
  const editBalanceForm = document.getElementById('edit-balance-form');
  editBalanceForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!IS_ADMIN) return alert('Admin only.');
    if (!CURRENT_USER_ID) return alert('Missing user id.');

    const newBalance = Number(document.getElementById('edit-balance')?.value);
    if (!Number.isFinite(newBalance)) return alert('Enter a valid number.');

    try {
      const { res, data } = await jsonFetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ userId: CURRENT_USER_ID, balance: newBalance }),
      });
      if (res.ok) {
        alert(`✅ Balance updated to $${data.user?.balance ?? newBalance}`);
      } else {
        alert(data.error || '❌ Balance update failed.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || '❌ Error updating balance.');
    }
  });
});
