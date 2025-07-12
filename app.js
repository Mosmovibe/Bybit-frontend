const API_URL = 'https://bybit-backend-xeuv.onrender.com';

// ✅ Utility: Add auth headers to fetch
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('❌ Session expired. Please log in again.');
    window.location.href = 'index.html';
    return;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// ✅ Register Form
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = registerForm.querySelector('input[name="fullname"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value.trim();

    if (!fullname || !email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      if (data.message) {
        alert('✅ Registered successfully! Please login.');
        window.location.href = '#login';
      } else {
        alert(data.error || '❌ Registration failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Something went wrong.');
    }
  });
}

// ✅ Login Form
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('✅ Login successful!');
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || '❌ Login failed.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Something went wrong.');
    }
  });
}
