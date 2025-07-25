// app.js (with login, signup, dashboard, profile upload, logout, and admin balance editor)

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // Signup
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullname = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Please log in.');
        window.location.href = 'index.html';
      } else {
        alert(data.error || 'Signup failed.');
      }
    });
  }

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed.');
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

  // Upload Profile Pic
  const profilePicInput = document.getElementById('profilePic');
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn && profilePicInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = profilePicInput.files[0];
      if (!file) return alert('No file selected');

      const formData = new FormData();
      formData.append('profilePic', file);

      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/upload-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.profilePicUrl) {
        document.getElementById('user-image').src = data.profilePicUrl;
        alert('Profile picture updated!');
      } else {
        alert(data.error || 'Upload failed');
      }
    });
  }

  // Load Dashboard
  async function fetchDashboard() {
    if (!token) return;
    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.fullname) {
      document.getElementById('username').textContent = data.fullname;
      document.getElementById('email').textContent = data.email;
      document.getElementById('balance').textContent = `$${data.balance}`;
      document.getElementById('joined').textContent = data.joinedAt;
      document.getElementById('package').textContent = data.package;
      if (data.profilePic) {
        document.getElementById('user-image').src = data.profilePic;
      }
    }
  }

  fetchDashboard();

  // Admin: Edit User Balance
  const editBalanceForm = document.getElementById('edit-balance-form');
  if (editBalanceForm) {
    editBalanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('edit-email').value;
      const newBalance = document.getElementById('edit-balance').value;

      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/admin/edit-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, newBalance })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Balance updated to $${data.balance}`);
      } else {
        alert(data.error || 'Balance update failed.');
      }
    });
  }
});
