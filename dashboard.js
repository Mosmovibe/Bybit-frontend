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

      const greeting = document.getElementById('greeting');
      const userBalance = document.getElementById('userBalance');
      const userEmail = document.getElementById('userEmail');
      const userPackage = document.getElementById('userPackage');
      const userJoined = document.getElementById('userJoined');
      const profileImg = document.getElementById('profileDisplay');

      if (greeting) greeting.textContent = `Hi, ${data.fullname}`;
      if (userBalance) userBalance.textContent = `$${data.balance}`;
      if (userEmail) userEmail.textContent = data.email;
      if (userPackage) userPackage.textContent = data.package;
      if (userJoined) userJoined.textContent = data.joinedAt;

      if (profileImg && data.profilePic) {
        profileImg.src = `${data.profilePic}?t=${Date.now()}`;
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
          document.getElementById('profileDisplay').src = `${data.profilePicUrl}?t=${Date.now()}`;
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

  // ✅ Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.body.classList.toggle('light-theme');
    });
  }

  // ✅ Example Crypto Ticker
  function fetchCryptoPrices() {
    const prices = {
      BTC: (28000 + Math.random() * 1000).toFixed(2),
      ETH: (1800 + Math.random() * 100).toFixed(2),
      SOL: (23 + Math.random() * 2).toFixed(2),
    };

    const btc = document.querySelector('#cryptoPrices li:nth-child(1) span');
    const eth = document.querySelector('#cryptoPrices li:nth-child(2) span');
    const sol = document.querySelector('#cryptoPrices li:nth-child(3) span');

    if (btc) btc.textContent = `$${prices.BTC}`;
    if (eth) eth.textContent = `$${prices.ETH}`;
    if (sol) sol.textContent = `$${prices.SOL}`;
  }

  setInterval(fetchCryptoPrices, 5000);
  fetchCryptoPrices();
});
