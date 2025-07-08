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
