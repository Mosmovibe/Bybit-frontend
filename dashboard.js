const API_URL = 'https://bybit-backend-xeuv.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('❌ Session expired. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // ✅ Fetch dashboard data
  fetch(`${API_URL}/api/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Session expired');
      return res.json();
    })
    .then(data => {
      const { fullname, balance, profilePic } = data;
      if (!fullname || typeof balance !== 'number') {
        throw new Error('Incomplete user data');
      }

      document.getElementById('greeting').textContent = `Hi, ${fullname}`;
      document.getElementById('userBalance').textContent = `$${balance.toFixed(2)}`;
      if (profilePic) {
        document.getElementById('profilePic').src = profilePic;
      }
    })
    .catch(err => {
      console.error('[Dashboard Error]', err);
      alert('❌ Session expired or unauthorized access. Please login again.');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });

  // ✅ Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  // ✅ Upload profile picture
  document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.querySelector('input[name="profilePic"]');
    if (!fileInput.files.length) {
      alert('❌ Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', fileInput.files[0]);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.profilePic) {
        document.getElementById('profilePic').src = data.profilePic;
        alert('✅ Profile picture updated!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      alert('❌ Error uploading profile picture.');
    }
  });
});
