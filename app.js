// ✅ REGISTER FORM — with fullname
const registerForm = document.querySelector('.register-form form');
if (registerForm) {
  console.log('✅ Register form loaded!');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = registerForm.querySelector('input[name="fullname"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value.trim();

    if (!fullname || !email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await res.json();
    console.log('[✅ Register]', data);

    if (data.message) {
      alert('✅ Registered successfully! Please login now.');
      window.location.href = '#login'; // scroll to login section
    } else {
      alert(data.error || '❌ Something went wrong!');
    }
  });
}

// ✅ LOGIN FORM
const loginForm = document.querySelector('.login-form form');
if (loginForm) {
  console.log('✅ Login form loaded!');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }

    const res = await fetch('https://bybit-backend-xeuv.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log('[✅ Login]', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('✅ Login successful!');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || '❌ Login failed!');
    }
  });
}
