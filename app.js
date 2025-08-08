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
    if (registerLoader) registerLoader.style.display = 'block';

    const fullname = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      if (registerLoader) registerLoader.style.display = 'none';

      if (res.ok) {
        alert('✅ Signup successful! Please log in.');
        window.location.href = 'index.html';
      } else {
        alert(data.error || 'Signup failed.');
      }
    } catch (err) {
      if (registerLoader) registerLoader.style.display = 'none';
      alert('❌ Signup error. Try again.');
    }
  });

  // === LOGIN ===
  const loginForm = document.getElementById('login-form');
  const loginLoader = document.getElementById('loginLoader');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginLoader) loginLoader.style.display = 'block';

    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (loginLoader) loginLoader.style.display = 'none';

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed.');
      }
    } catch (err) {
      if (loginLoader) loginLoader.style.display = 'none';
      alert('❌ Login failed. Try again.');
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
  const profilePicInput = document.getElementById('profilePic');
  const uploadBtn = document.getElementById('uploadBtn');

  uploadBtn?.addEventListener('click', async () => {
    const file = profilePicInput?.files?.[0];
    if (!file) return alert('No file selected');

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await fetch(`${API_URL}/api/upload-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.profilePicUrl) {
        document.querySelectorAll('#user-image').forEach(img => {
          img.src = `${data.profilePicUrl}?t=${Date.now()}`;
        });
        alert('✅ Profile picture updated!');
      } else {
        alert(data.error || '❌ Upload failed');
      }
    } catch (err) {
      alert('❌ Upload error. Try again.');
    }
  });

  // === FETCH DASHBOARD DATA ===
  async function fetchDashboard() {
    if (!token || !isDashboard) return;

    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.fullname) {
        const usernameEl = document.getElementById('username');
        const emailEl = document.getElementById('email');
        const joinedEl = document.getElementById('joined');
        const packageEl = document.getElementById('package');
        const balanceEl = document.getElementById('balance');

        if (usernameEl) usernameEl.textContent = data.fullname;
        if (emailEl) emailEl.textContent = data.email;
        if (joinedEl) joinedEl.textContent = data.joinedAt;
        if (packageEl) packageEl.textContent = data.package;
        if (balanceEl) balanceEl.textContent = `$${data.balance}`;

        if (data.profilePic) {
          document.querySelectorAll('#user-image').forEach(img => {
            img.src = `${data.profilePic}?t=${Date.now()}`;
          });
        }
      } else {
        console.error(data.error || 'Failed to fetch dashboard data');
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

    const email = document.getElementById('edit-email')?.value;
    const newBalance = document.getElementById('edit-balance')?.value;

    try {
      const res = await fetch(`${API_URL}/api/admin/edit-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, newBalance })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Balance updated to $${data.balance}`);
      } else {
        alert(data.error || '❌ Balance update failed.');
      }
    } catch (err) {
      alert('❌ Error updating balance.');
    }
  });
});
