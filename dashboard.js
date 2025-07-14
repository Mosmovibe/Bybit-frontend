const API_URL = 'https://bybit-backend-xeuv.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // ✅ Check Token
  if (!token) {
    alert('❌ Session expired. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // ✅ Load Dashboard Data
  fetch(`${API_URL}/api/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async res => {
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();

      if (!data.fullname || !data.email) throw new Error("Missing user data");

      document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
      document.getElementById('userBalance').textContent = `$${data.balance}`;
      document.getElementById('userEmail').textContent = data.email;

      if (data.profilePic) {
        const profileImg = document.getElementById('profileDisplay');
        profileImg.src = data.profilePic;
        profileImg.onerror = () => {
          profileImg.src = 'https://via.placeholder.com/100';
        };
      }
    })
    .catch(err => {
      console.error('[Dashboard Error]', err.message);
      alert('❌ Session expired or failed to load dashboard.');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });

  // ✅ Logout Logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // ✅ Profile Picture Upload Logic
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById('profilePicInput');
      if (!fileInput || !fileInput.files.length) {
        alert('❌ Please select an image.');
        return;
      }

      const formData = new FormData();
      formData.append('profilePic', fileInput.files[0]);

      try {
        const res = await fetch(`${API_URL}/api/upload-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.profilePicUrl) {
          document.getElementById('profileDisplay').src = data.profilePicUrl;
          alert('✅ Profile picture updated!');
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (err) {
        console.error('[Upload Error]', err.message);
        alert('❌ Error uploading profile picture.');
      }
    });
  }
});
document.getElementById('themeToggleBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
});

// Example ticker (you can replace with real API)
function fetchCryptoPrices() {
  const prices = {
    BTC: (28000 + Math.random() * 1000).toFixed(2),
    ETH: (1800 + Math.random() * 100).toFixed(2),
    SOL: (23 + Math.random() * 2).toFixed(2),
  };

  document.querySelector('#cryptoPrices li:nth-child(1) span').textContent = `$${prices.BTC}`;
  document.querySelector('#cryptoPrices li:nth-child(2) span').textContent = `$${prices.ETH}`;
  document.querySelector('#cryptoPrices li:nth-child(3) span').textContent = `$${prices.SOL}`;
}
setInterval(fetchCryptoPrices, 5000);
fetchCryptoPrices();
document.getElementById('userPackage').textContent = data.package;
document.getElementById('userJoined').textContent = data.joinedAt;
