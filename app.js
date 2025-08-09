document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://bybit-backend-xeuv.onrender.com';
  const token = localStorage.getItem('token');
  const isDashboard = window.location.pathname.includes('dashboard.html');

  // Redirect to login if not authenticated on dashboard
  if (isDashboard && !token) {
    window.location.href = 'index.html';
    return;
  }

  // Small helpers
  const $ = (s) => document.querySelector(s);
  const setText = (sel, v) => { const el = $(sel); if (el) el.textContent = v ?? ''; };

  /* ========== SIGNUP (uses /api/register) ========== */
  const signupForm = document.getElementById('signup-form');
  const registerLoader = document.getElementById('registerLoader');

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = signupForm.querySelector('input[name="fullname"]')?.value.trim();
    const email = signupForm.querySelector('input[name="email"]')?.value.trim();
    const password = signupForm.querySelector('input[name="password"]')?.value.trim();

    if (!fullname || !email || !password) return alert('❌ Please fill in all fields.');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return alert('❌ Invalid email format.');
    if (password.length < 6) return alert('❌ Password must be at least 6 characters.');

    try {
      if (registerLoader) registerLoader.style.display = 'block';

      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        alert('✅ Signup successful!');
        window.location.href = 'dashboard.html';
      } else if (res.status === 409) {
        alert('❌ Email already in use. Please log in.');
        window.location.hash = '#login';
      } else {
        alert(data.error || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Signup error. Try again.');
    } finally {
      if (registerLoader) registerLoader.style.display = 'none';
    }
  });

  /* ========== LOGIN ========== */
  const loginForm = document.getElementById('login-form');
  const loginLoader = document.getElementById('loginLoader');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginLoader) loginLoader.style.display = 'block';

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Login failed. Try again.');
    } finally {
      if (loginLoader) loginLoader.style.display = 'none';
    }
  });

  /* ========== LOGOUT ========== */
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-button');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('✅ Logged out successfully');
    window.location.href = 'index.html';
  });

  /* ========== PROFILE PIC UPLOAD ========== */
  const profilePicInput = document.getElementById('uploadProfilePic');
  const uploadBtn = document.getElementById('uploadBtn');

  uploadBtn?.addEventListener('click', async () => {
    if (!profilePicInput) return alert('Profile picture input not found.');
    const file = profilePicInput.files?.[0];
    if (!file) return alert('Please choose a picture first.');

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await fetch(`${API_URL}/api/upload-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type for FormData
        body: formData,
      });
      const data = await res.json();

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
      alert('❌ Upload error. Try again.');
    }
  });

  /* ========== DASHBOARD LOAD (captures _id + isAdmin) ========== */
  let CURRENT_USER_ID = null;
  let IS_ADMIN = false;

  async function fetchDashboard() {
    if (!token || !isDashboard) return;

    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || 'Failed to fetch dashboard data');
        if (res.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = 'index.html';
        }
        return;
      }

      // keep id/admin for admin actions
      CURRENT_USER_ID = data._id || null;
      IS_ADMIN = !!data.isAdmin;

      // UI
      setText('#fullName', data.fullname || 'N/A');
      setText('.plan-value', data.investmentPlan || data.package || 'N/A');
      setText('.amount-value', data.amountInvested ? Number(data.amountInvested).toLocaleString() : '0');
      if (data.profilePic && document.getElementById('profilePic')) {
        document.getElementById('profilePic').src = `${data.profilePic}?t=${Date.now()}`;
      }

      // Prefill admin controls if present
      const planInput = document.getElementById('planInput');
      const amountInput = document.getElementById('amountInput');
      if (planInput) planInput.value = data.investmentPlan || 'Free';
      if (amountInput) amountInput.value = Number(data.amountInvested || 0);

      // Show admin-only section if present
      const updateSection = document.getElementById('updateSection');
      if (updateSection) updateSection.style.display = IS_ADMIN ? 'block' : 'none';
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  }
  fetchDashboard();

  /* ========== ADMIN: UPDATE PLAN/AMOUNT (self, using /api/admin/update-user) ========== */
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
      const res = await fetch(`${API_URL}/api/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: CURRENT_USER_ID, investmentPlan: plan, amountInvested: amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');

      // reflect new values
      setText('.plan-value', data.user?.investmentPlan ?? plan);
      setText('.amount-value', Number(data.user?.amountInvested ?? amount).toLocaleString());

      updateMsg.textContent = 'Updated!'; updateMsg.style.color = 'green';
    } catch (e) {
      console.error('Admin update failed:', e);
      updateMsg.textContent = e.message || 'Update failed.'; updateMsg.style.color = 'red';
    }
  });

  /* ========== ADMIN: EDIT BALANCE (your backend has NO /api/admin/edit-balance) ========== */
  // If you want to edit balance via UI, reuse /api/admin/update-user similarly:
  const editBalanceForm = document.getElementById('edit-balance-form');
  editBalanceForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!IS_ADMIN) return alert('Admin only.');

    // This updates the CURRENT (logged-in) admin user. To edit others by email,
    // you need a backend route to look up userId by email.
    const newBalance = Number(document.getElementById('edit-balance')?.value);
    if (!Number.isFinite(newBalance)) return alert('Enter a valid number.');

    try {
      const res = await fetch(`${API_URL}/api/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: CURRENT_USER_ID, balance: newBalance }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Balance updated to $${data.user?.balance ?? newBalance}`);
      } else {
        alert(data.error || '❌ Balance update failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error updating balance.');
    }
  });
});
