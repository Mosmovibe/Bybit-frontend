async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must login first!');
    window.location.href = 'index.html';
    return;
  }

  const res = await fetch('http://localhost:3000/api/dashboard', {
    headers: { 'Authorization': token }
  });

  const data = await res.json();
  console.log(data);

  if (!data.email) {
    alert('Unauthorized or error. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('greeting').textContent = `Hi, ${data.email}`;
  document.getElementById('userBalance').textContent = data.balance;

  if (data.profilePic) {
    document.getElementById('profilePic').src = `http://localhost:3000/${data.profilePic}`;
  } else {
    document.getElementById('profilePic').src = 'https://via.placeholder.com/120';
  }

  if (data.isAdmin) {
    document.getElementById('adminControls').style.display = 'block';
  }
}

window.addEventListener('DOMContentLoaded', loadDashboard);

// ✅ Upload profile pic
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const fileInput = document.querySelector('input[name="profilePic"]');
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append('profilePic', file);

  const res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': token
    },
    body: formData
  });

  const data = await res.json();
  console.log(data);

  if (data.profilePic) {
    alert('✅ Profile picture updated!');
    document.getElementById('profilePic').src = `http://localhost:3000/${data.profilePic}`;
  } else {
    alert(data.error || 'Upload failed.');
  }
});
