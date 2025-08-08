const API_URL = 'https://bybit-backend-xeuv.onrender.com';

// ✅ Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return handleSessionExpired();

  loadProfile();
  loadChart();
  loadCryptoPrices();
  setInterval(loadCryptoPrices, 5000);

  // Event Listeners
  document.getElementById('uploadForm')?.addEventListener('submit', uploadProfilePic);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('editBalanceForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    editUserBalance();
  });
});

// ✅ Session Expired Handler
function handleSessionExpired() {
  alert("❌ Session expired. Please login again.");
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// ✅ Load Profile Info
async function loadProfile() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();

    // Profile Details
    document.getElementById('fullname').textContent = data.fullname || 'User';
    document.getElementById('email').textContent = data.email || '';
    document.getElementById('userPackage').textContent = data.package || 'Free';
    document.getElementById('joinedDate').textContent = data.joinedAt || '';
    document.getElementById('balanceDisplay').textContent = `$${parseFloat(data.balance).toFixed(2)}`;

    // Profile Picture
    const imageUrl = data.profilePic || 'https://via.placeholder.com/100';
    document.getElementById('mainProfile').src = imageUrl;
    document.getElementById('profileDisplay').src = imageUrl;

    // Full Name + Plan
    const profileNameEl = document.getElementById('profileNameDisplay');
    if (profileNameEl) {
      profileNameEl.textContent = `${data.fullname || 'User'} (${data.package || 'Free'})`;
    }
  } catch (err) {
    console.error('[Profile Load Error]', err);
    handleSessionExpired();
  }
}

// ✅ Upload Profile Picture
async function uploadProfilePic(e) {
  e.preventDefault();

  const fileInput = document.getElementById('profilePicInput');
  if (!fileInput?.files.length) return alert('❌ No file selected.');

  const formData = new FormData();
  formData.append('profilePic', fileInput.files[0]);

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/upload-profile`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.profilePicUrl) {
      document.getElementById('mainProfile').src = data.profilePicUrl;
      document.getElementById('profileDisplay').src = data.profilePicUrl;
      alert('✅ Profile picture updated!');
    } else {
      throw new Error(data.error || 'Upload failed.');
    }
  } catch (err) {
    console.error('[Upload Error]', err);
    alert('❌ Upload failed. Try again.');
  }
}

// ✅ Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// ✅ Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
}

// ✅ Dummy Crypto Prices Loader
function loadCryptoPrices() {
  const btc = (28000 + Math.random() * 1000).toFixed(2);
  const eth = (1800 + Math.random() * 100).toFixed(2);
  const sol = (23 + Math.random() * 2).toFixed(2);

  document.querySelector('#cryptoPrices li:nth-child(1) span').textContent = `$${btc}`;
  document.querySelector('#cryptoPrices li:nth-child(2) span').textContent = `$${eth}`;
  document.querySelector('#cryptoPrices li:nth-child(3) span').textContent = `$${sol}`;
}

// ✅ Chart Loader
function loadChart() {
  const ctx = document.getElementById('lineChart')?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{
        label: 'Profit ($)',
        data: [120, 200, 150, 300, 250],
        borderColor: 'gold',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { ticks: { color: 'white' } }
      }
    }
  });
}

// ✅ Admin Balance Editor
async function editUserBalance() {
  const email = document.getElementById('adminEmailInput')?.value;
  const newBalance = document.getElementById('adminNewBalance')?.value;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/api/admin/edit-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, newBalance })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Balance updated');
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    alert('❌ ' + err.message);
  }
}
