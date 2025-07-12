const API_URL = 'https://bybit-backend-xeuv.onrender.com';

// ✅ Check for token
const token = localStorage.getItem('token');
if (!token) {
  alert('❌ Session expired. Please login again.');
  window.location.href = 'index.html';
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
    if (!data.fullname || !data.balance) {
      throw new Error('Incomplete user data');
    }

    document.getElementById('greeting').textContent = `Hi, ${data.fullname}`;
    document.getElementById('userBalance').textContent = `$${data.balance.toFixed(2)}`;

    if (data.profilePic) {
      document.getElementById('profilePic').src = data.profilePic;
    }
  })
  .catch(err => {
    console.error(err);
    alert('❌ Session expired or unauthorized access. Please login again.');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

// ✅ Logout button logic
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

// ✅ Upload profile picture
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = e.target.querySelector('input[name="profilePic"]');
  if (!fileInput.files.length) {
    alert('❌ Please select an image to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('profilePic', fileInput.files[0]);

  try {
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.profilePic) {
      document.getElementById('profilePic').src = data.profilePic;
      alert('✅ Profile picture updated!');
    } else {
      alert(data.error || '❌ Failed to upload profile picture.');
    }
  } catch (err) {
    console.error(err);
    alert('❌ Error uploading profile picture.');
  }
});
