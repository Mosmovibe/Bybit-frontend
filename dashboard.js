// ✅ Load user dashboard info
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must login first!');
    window.location.href = 'index.html#login';
    return;
  }

  const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/dashboard', {
    headers: { 'Authorization': token }
  });

  const data = await res.json();
  console.log(data);

  if (!data.email) {
    alert('Session expired or unauthorized. Please login again.');
    localStorage.removeItem('token');
    window.location.href = 'index.html#login';
    return;
  }

  // ✅ Fill user info
  document.getElementById('greeting').textContent = `Hi, ${data.email}`;
  document.getElementById('userBalance').textContent = data.balance;

  if (data.profilePic) {
    document.getElementById('profilePic').src = `https://bybit-backend-xeuv.onrender.com/${data.profilePic}`;
  } else {
    document.getElementById('profilePic').src = 'https://via.placeholder.com/120';
  }
}

window.addEventListener('DOMContentLoaded', loadDashboard);

// ✅ Upload profile picture logic
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const fileInput = document.querySelector('input[name="profilePic"]');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('profilePic', file);

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': token },
      body: formData
    });

    const data = await res.json();
    console.log(data);

    if (data.profilePic) {
      alert('✅ Profile picture updated!');
      document.getElementById('profilePic').src = `https://bybit-backend-xeuv.onrender.com/${data.profilePic}`;
    } else {
      alert(data.error || 'Upload failed.');
    }
  });
}
