// ✅ Load user dashboard info when page loads
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('❌ You must login first!');
    window.location.href = 'index.html#login';
    return;
  }

  try {
    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/dashboard', {
      headers: { Authorization: token }
    });

    const data = await res.json();
    console.log('[✅ Dashboard Data]', data);

    if (!data.fullname) {
      alert('❌ Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = 'index.html#login';
      return;
    }

    document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
    document.getElementById('userBalance').textContent = `$${Number(data.balance).toFixed(2)}`;

    const profilePicEl = document.getElementById('profilePic');
    profilePicEl.src = data.profilePic
      ? `https://bybit-backend-xeuv.onrender.com/${data.profilePic}`
      : 'https://via.placeholder.com/120';

  } catch (err) {
    console.error('❌ Dashboard load error:', err);
    alert('❌ Something went wrong. Please login again.');
    localStorage.removeItem('token');
    window.location.href = 'index.html#login';
  }
}

window.addEventListener('DOMContentLoaded', loadDashboard);

// ✅ Upload profile pic
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ You must be logged in.');
      window.location.href = 'index.html#login';
      return;
    }

    const fileInput = document.querySelector('input[name="profilePic"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      alert('❌ Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/upload', {
        method: 'POST',
        headers: { Authorization: token },
        body: formData
      });

      const data = await res.json();
      console.log('[✅ Upload Response]', data);

      if (data.profilePic) {
        alert('✅ Profile picture updated!');
        document.getElementById('profilePic').src = `https://bybit-backend-xeuv.onrender.com/${data.profilePic}`;
      } else {
        alert(data.error || '❌ Upload failed.');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('❌ Upload failed. Try again.');
    }
  });
}

// ✅ Logout button logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('✅ You have been logged out.');
    window.location.href = 'index.html#hero'; // Home
  });
}
