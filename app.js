// ✅ Register
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullname = registerForm.querySelector('input[name="fullname"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value.trim();

    if (!fullname || !email || !password) {
      alert('❌ Fill all fields.');
      return;
    }

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await res.json();
    if (data.message) {
      alert('✅ Registered! Now login.');
      window.location.href = '#login';
    } else {
      alert(data.error || '❌ Something went wrong.');
    }
  });
}

// ✅ Login
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      alert('❌ Fill all fields.');
      return;
    }

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('✅ Login success!');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || '❌ Login failed.');
    }
  });
}
