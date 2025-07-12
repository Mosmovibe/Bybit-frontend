const API_URL = 'https://bybit-backend-xeuv.onrender.com';

const token = localStorage.getItem('token');
if (!token) {
  alert('Session expired. Please login again.');
  window.location.href = 'index.html';
}

// ✅ Get dashboard data
fetch(`${API_URL}/dashboard`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => {
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  })
  .then(data => {
    document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
    document.getElementById('userBalance').textContent = `$${data.balance.toFixed(2)}`;
    if (data.profilePic) {
      document.getElementById('profilePic').src = data.profilePic;
    }
  })
  .catch(err => {
    alert('Session expired. Please login again.');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

// ✅ Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

// ✅ Upload profile pic
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = e.target.querySelector('input[name="profilePic"]');
  const formData = new FormData();
  formData.append('profilePic', fileInput.files[0]);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  document.getElementById('profilePic').src = data.profilePic;
});
