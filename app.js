// ✅ REGISTER FORM
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = registerForm.querySelector('input[name="fullname"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value.trim();

    if (!fullname || !email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });

      const data = await res.json();
      console.log('[✅ Register Response]', data);

      if (data.message) {
        alert('✅ Registered successfully! Please login now.');
        window.location.href = '#login';
      } else {
        alert(data.error || '❌ Registration failed.');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      alert('❌ Registration failed. Try again.');
    }
  });
}

// ✅ LOGIN FORM
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('[✅ Login Response]', data);

      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('✅ Login successful!');
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || '❌ Login failed.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('❌ Login failed. Try again.');
    }
  });
}
