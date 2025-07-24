const API_URL = 'https://bybit-backend-xeuv.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('❌ Session expired. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // ✅ Load Dashboard Info
  fetch(`${API_URL}/api/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(async res => {
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();

      // ✅ Fill profile section
      document.getElementById('fullname')?.textContent = data.fullname || 'User';
      document.getElementById('userEmail')?.textContent = data.email || '';
      document.getElementById('userBalance')?.textContent = `$${data.balance || 0}`;
      document.getElementById('userPackage')?.textContent = data.package || '';
      document.getElementById('userJoined')?.textContent = data.joinedAt || '';
      document.getElementById('greeting')?.textContent = `Hi, ${data.fullname || 'there'}!`;

      // ✅ Profile Image
      if (data.profilePic) {
        const imgUrl = `${data.profilePic}?t=${Date.now()}`;
        ['profileDisplay', 'mainProfile', 'profilePreview'].forEach(id => {
          const img = document.getElementById(id);
          if (img) {
            img.src = imgUrl;
            img.onerror = () => { img.src = 'https://via.placeholder.com/100'; };
          }
        });
      }
    })
    .catch(err => {
      console.error('[Dashboard Error]', err.message);
      alert('❌ Failed to load dashboard.');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });

  // ✅ Upload Profile Picture
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('profilePicInput');
      if (!fileInput || !fileInput.files.length) {
        return alert('❌ Please select a profile picture.');
      }

      const formData = new FormData();
      formData.append('profilePic', fileInput.files[0]);

      try {
        const res = await fetch(`${API_URL}/api/upload-profile`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.profilePicUrl) {
          const imgUrl = `${data.profilePicUrl}?t=${Date.now()}`;
          ['profileDisplay', 'mainProfile', 'profilePreview'].forEach(id => {
            const img = document.getElementById(id);
            if (img) img.src = imgUrl;
          });
          alert('✅ Profile picture updated!');
        } else {
          throw new Error(data.error || 'Upload failed.');
        }
      } catch (err) {
        console.error('[Upload Error]', err.message);
        alert('❌ Error uploading profile picture.');
      }
    });
  }

  // ✅ Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
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

  // ✅ Crypto Prices
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
