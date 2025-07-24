const API_URL = 'https://bybit-backend-xeuv.onrender.com';

// ✅ Utility: Authenticated Fetch Wrapper
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
      'Content-Type': 'application/json',
    }
  });
}

// ✅ Registration Logic
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = registerForm.querySelector('input[name="fullname"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value.trim();

    if (!fullname || !email || !password) {
      return alert('❌ Please fill in all fields.');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return alert('❌ Invalid email format.');
    }

    if (password.length < 6) {
      return alert('❌ Password must be at least 6 characters.');
    }

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed.');

      alert('✅ Registration successful! Please log in.');
      window.location.href = '#login';
    } catch (err) {
      alert(`❌ Registration failed: ${err.message}`);
    }
  });
}

// ✅ Login Logic
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      return alert('❌ Please fill in all fields.');
    }

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.message || data.error || 'Login failed.');

      localStorage.setItem('token', data.token);
      alert('✅ Login successful!');
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert(`❌ Login failed: ${err.message}`);
    }
  });
}

// ✅ Load Dashboard Profile Info
async function loadProfile() {
  try {
    const res = await authFetch(`${API_URL}/api/dashboard`);
    const data = await res.json();

    if (!data) throw new Error('Invalid profile data');

    // Set text content safely
    document.getElementById("fullname")?.textContent = data.fullname || 'User';
    document.getElementById("email")?.textContent = data.email || '';
    document.getElementById("userEmail")?.textContent = data.email || '';
    document.getElementById("userPackage")?.textContent = data.package || '';
    document.getElementById("userJoined")?.textContent = data.joinedAt || '';
    document.getElementById("greeting")?.textContent = `Hi, ${data.fullname || 'there'}!`;

    // Profile images
    const imageUrl = data.profilePic ? `${data.profilePic}?t=${Date.now()}` : 'https://via.placeholder.com/100';
    ['mainProfile', 'profilePreview', 'profileDisplay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = imageUrl;
    });

    // Optional extra info
    const details = document.querySelector(".details");
    if (details) {
      details.innerHTML = `
        <p><strong>Full Name:</strong> ${data.fullname || ''}</p>
        <p><strong>Email:</strong> ${data.email || ''}</p>
        <p><strong>Package:</strong> ${data.package || 'N/A'}</p>
      `;
    }

  } catch (err) {
    console.error("❌ Error loading profile", err);
    window.location.href = 'index.html';
  }
}

// ✅ Load Crypto Ticker
async function loadTicker() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
    const data = await res.json();

    const ticker = document.getElementById("ticker");
    if (ticker) {
      ticker.innerHTML = `
        <div>BTC: $${data.bitcoin.usd}</div>
        <div>ETH: $${data.ethereum.usd}</div>
      `;
    }
  } catch (err) {
    console.error("❌ Error loading ticker", err);
  }
}

// ✅ If on dashboard, load profile and ticker
if (window.location.pathname.includes("dashboard.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadTicker();
  });
}
