document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://bybit-backend-xeuv.onrender.com';
  const token = localStorage.getItem('token');
  const isDashboard = window.location.pathname.includes('dashboard.html');

  // Redirect to login if not authenticated on dashboard
  if (isDashboard && !token) {
    window.location.href = 'index.html';
    return;
  }

  // === SIGNUP ===
  const signupForm = document.getElementById('signup-form');
  const registerLoader = document.getElementById('registerLoader');

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerLoader?.style.display = 'block';

    const fullname = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await res.json();
      registerLoader.style.display = 'none';

      if (res.ok) {
        alert('✅ Signup successful! Please log in.');
        window.location.href = 'index.html';
      } else {
        alert(data.error || 'Signup failed.');
      }
    } catch (err) {
      registerLoader.style.display = 'none';
      alert('❌ Signup error. Try again.');
      console.error(err);
    }
  });

  // === LOGIN ===
  const loginForm = document.getElementById('login-form');
  const loginLoader = document.getElementById('loginLoader');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginLoader.style.display = 'block';

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      loginLoader.style.display = 'none';

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed.');
      }
    } catch (err) {
      loginLoader.style.display = 'none';
      alert('❌ Login failed. Try again.');
      console.error(err);
    }
  });

  // === LOGOUT ===
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-button');
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('✅ Logged out successfully');
    window.location.href = 'index.html';
  });

  // === UPLOAD PROFILE PICTURE ===
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.profilePicUrl) {
        // IMPORTANT: Use class selector for multiple images, IDs must be unique
        document.querySelectorAll('.user-image').forEach(img => {
          img.src = `${data.profilePicUrl}?t=${Date.now()}`;
        });
        alert('✅ Profile picture updated!');
      } else {
        alert(data.error || '❌ Upload failed');
      }
    } catch (err) {
      alert('❌ Upload error. Try again.');
      console.error(err);
    }
  });

  // === FETCH DASHBOARD DATA ===
  async function fetchDashboard() {
    if (!token || !isDashboard) return;

    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.fullname) {
        const fullNameEl = document.getElementById('fullName');
        const planValueEl = document.querySelector('.plan-value');
        const amountValueEl = document.querySelector('.amount-value');
        const profilePicEl = document.getElementById('profilePic');

        if (fullNameEl) fullNameEl.textContent = data.fullname || 'N/A';
        if (planValueEl) planValueEl.textContent = data.package || 'N/A';
        if (amountValueEl) amountValueEl.textContent = data.balance ? Number(data.balance).toLocaleString() : '0';
        if (profilePicEl && data.profilePic) profilePicEl.src = `${data.profilePic}?t=${Date.now()}`;
      } else {
        console.error(data.error || 'Failed to fetch dashboard data');
        if (res.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = 'index.html';
        }
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  }
  fetchDashboard();

  // === ADMIN: EDIT BALANCE ===
  const editBalanceForm = document.getElementById('edit-balance-form');
  editBalanceForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('edit-email')?.value.trim();
    const newBalance = document.getElementById('edit-balance')?.value;

    try {
      const res = await fetch(`${API_URL}/api/admin/edit-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, newBalance }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Balance updated to $${data.balance}`);
      } else {
        alert(data.error || '❌ Balance update failed.');
      }
    } catch (err) {
      alert('❌ Error updating balance.');
      console.error(err);
    }
  });
});
