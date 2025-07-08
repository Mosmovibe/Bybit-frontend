// ✅ LOGIN FORM
const loginForm = document.querySelector('section.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('✅ Logged in successfully!');
      window.location.href = 'dashboard.html'; // ✅ Redirect to dashboard page!
    } else {
      alert(data.error || 'Login failed!');
    }
  });
}
// ✅ Register form
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = registerForm.querySelector('input[name="fullname"]')?.value;
    const email = registerForm.querySelector('input[name="email"]').value;
    const password = registerForm.querySelector('input[name="password"]').value;

    const res = await fetch('https://YOUR-BACKEND-NAME.onrender.com/api/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await res.json();
    if (data.message) {
      alert('✅ Registered successfully! Now login.');
    } else {
      alert(data.error || 'Something went wrong!');
    }
  });
}

// ✅ Login form
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('✅ Login successful!');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || 'Login failed!');
    }
  });
}
