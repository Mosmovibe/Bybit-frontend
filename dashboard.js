// ✅ Check if token exists
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html'; // Redirect to login
}

// ✅ Fetch dashboard data
fetch('/api/dashboard', {
  headers: { 'Authorization': token }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
    document.getElementById('userBalance').textContent = `$${data.balance.toFixed(2)}`;
    if (data.profilePic) {
      document.getElementById('profilePic').src = data.profilePic;
    }
  })
  .catch(err => {
    console.error(err);
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

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Authorization': token },
    body: formData
  });

  const data = await response.json();
  document.getElementById('profilePic').src = data.profilePic;
});
