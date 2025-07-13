const API_URL = 'https://bybit-backend-xeuv.onrender.com';

// ✅ Auth fetch wrapper
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

// ✅ Register Form Logic
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

    // ✅ Correct email regex (no double escaping)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('❌ Invalid email format.');
      return;
    }

    if (password.length < 6) {
      alert('❌ Password must be at least 6 characters.');
      return;
    }

    try {
      console.log('Sending:', { fullname, email, password });

      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      console.log('[Signup Response]', data);

      if (res.ok && data.message) {
        alert('✅ Registration successful! Please log in.');
        window.location.href = '#login';
      } else {
        throw new Error(data.error || data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('[Signup Error]', err.message);
      alert(`❌ Registration failed: ${err.message}`);
    }
  });
}

// ✅ Login Form Logic
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
      console.log('[Login Response]', data);

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        alert('✅ Login successful!');
        window.location.href = 'dashboard.html';
      } else {
        throw new Error(data.message || data.error || 'Login failed.');
      }
    } catch (err) {
      console.error('[Login Error]', err.message);
      alert(`❌ Login failed: ${err.message}`);
    }
  });
}
