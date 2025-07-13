const API_URL = 'https://bybit-backend-xeuv.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('❌ Session expired. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // Load dashboard data
  fetch(`${API_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.fullname) throw new Error("Missing user data");

      document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
      document.getElementById('userBalance').textContent = `$${data.balance.toFixed(2)}`;
      document.getElementById('userEmail').textContent = data.email;

      if (data.profilePic) {
        document.getElementById('profileDisplay').src = data.profilePic;
      }
    })
    .catch(err => {
      console.error('[Dashboard Error]', err);
      alert('Session expired or error loading dashboard.');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  // Upload profile picture
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('profilePicInput');
    if (!fileInput.files.length) {
      alert('❌ Please select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', fileInput.files[0]);

    try {
      const res = await fetch(`${API_URL}/api/upload-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
      console.error('[Upload Error]', err);
      alert('❌ Error uploading profile picture.');
    }
  });
});
