document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://bybit-backend-xeuv.onrender.com';
  const token = localStorage.getItem('token');

  // Redirect if not logged in and you're on the dashboard
  if (window.location.pathname.includes('dashboard.html') && !token) {
    window.location.href = 'index.html';
  }

  // Signup
  const signupForm = document.getElementById('signup-form');
  const registerLoader = document.getElementById('registerLoader');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerLoader.style.display = 'block';

      const fullname = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      try {
        const res = await fetch(`${API_URL}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullname, email, password })
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
      }
    });
  }

  // Login
  const loginForm = document.getElementById('login-form');
  const loginLoader = document.getElementById('loginLoader');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginLoader.style.display = 'block';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
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
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // Upload Profile Picture
  const profilePicInput = document.getElementById('profilePic');
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn && profilePicInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = profilePicInput.files[0];
      if (!file) return alert('No file selected');

      const formData = new FormData();
      formData.append('profilePic', file);

      const res = await fetch(`${API_URL}/api/upload-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.profilePicUrl) {
        document.querySelectorAll('#user-image').forEach(img => {
          img.src = `${data.profilePicUrl}?t=${Date.now()}`; // bust cache
        });
        alert('✅ Profile picture updated!');
      } else {
        alert(data.error || '❌ Upload failed');
      }
    });
  }

  // Load Dashboard Data
  async function fetchDashboard() {
    if (!token) return;

    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.fullname) {
      document.getElementById('username').textContent = data.fullname;
      document.getElementById('email').textContent = data.email;
      document.getElementById('joined').textContent = data.joinedAt;
      document.getElementById('package').textContent = data.package;
      if (document.getElementById('balance')) {
        document.getElementById('balance').textContent = `$${data.balance}`;
      }
      if (data.profilePic) {
        document.querySelectorAll('#user-image').forEach(img => {
          img.src = `${data.profilePic}?t=${Date.now()}`;
        });
      }
    }
  }

  fetchDashboard();

  // Admin Edit Balance
  const editBalanceForm = document.getElementById('edit-balance-form');
  if (editBalanceForm) {
    editBalanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('edit-email').value;
      const newBalance = document.getElementById('edit-balance').value;

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
    });
  }
});
