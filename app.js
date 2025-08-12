// app.js  (drop-in)
document.addEventListener('DOMContentLoaded', function () {
  /* ===== CONFIG (keeps path prefixes like /v1) ===== */
  var BACKEND_ORIGIN = 'https://bybit-backend-xeuv.onrender.com';
  var API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || BACKEND_ORIGIN;

  function normalizeApiUrl(input) {
    try {
      var u = new URL(input);
      return (u.origin + u.pathname).replace(/\/+$/, ''); // keep path, drop trailing slash
    } catch (e) {
      return BACKEND_ORIGIN;
    }
  }
  API_URL = normalizeApiUrl(API_URL);

  // Never point API_URL at the frontend
  try {
    var FE = normalizeApiUrl(location.origin);
    if (API_URL === FE) API_URL = normalizeApiUrl(BACKEND_ORIGIN);
  } catch (e) {}

  function buildURL(p) {
    p = String(p || '');
    return API_URL + (p.charAt(0) === '/' ? '' : '/') + p;
  }

  /* ===== tiny helpers ===== */
  function $(sel) { return document.querySelector(sel); }
  function setToken(t) { try { localStorage.setItem('token', t); } catch (e) {} }

  async function jsonFetch(path, opts) {
    var url = buildURL(path);
    var options = Object.assign({
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    }, (opts || {}));

    // Ensure no Authorization header is sent unless explicitly provided
    if (!opts || !opts.headers || !('Authorization' in opts.headers)) {
      if (options.headers && options.headers.Authorization) {
        delete options.headers.Authorization;
      }
    }

    var res, data = {};
    try {
      res = await fetch(url, options);
    } catch (e) {
      alert('Network/CORS error contacting the API.');
      throw e;
    }
    try { data = await res.json(); } catch (e) { data = {}; }
    return { res: res, data: data, url: url };
  }

  /* ===== SIGNUP ===== */
  var signupForm = $('#signup-form');
  var registerLoader = $('#registerLoader');
  var signupBtn = signupForm ? signupForm.querySelector('button[type="submit"]') : null;

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var fullnameEl = signupForm.querySelector('input[name="fullname"]');
      var emailEl = signupForm.querySelector('input[name="email"]');
      var passwordEl = signupForm.querySelector('input[name="password"]');

      var fullname = (fullnameEl && fullnameEl.value || '').trim();
      var email = (emailEl && emailEl.value || '').trim().toLowerCase();
      var password = (passwordEl && passwordEl.value || '');

      if (!fullname || !email || !password) { alert('❌ Please fill in all fields.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('❌ Invalid email.'); return; }
      if (password.length < 8) { alert('❌ Password must be at least 8 characters.'); return; }

      if (registerLoader) registerLoader.style.display = 'block';
      if (signupBtn) signupBtn.disabled = true;

      try {
        // Try /api/register; if 404, try /api/signup
        var attempt = await jsonFetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullname: fullname, email: email, password: password })
        });

        if (attempt.res.status === 404) {
          attempt = await jsonFetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname: fullname, email: email, password: password })
          });
        }

        if (attempt.res.ok && attempt.data && attempt.data.token) {
          setToken(attempt.data.token);
          alert('✅ Signup successful!');
          location.href = 'dashboard.html';
          return;
        }

        if (attempt.res.status === 409) {
          alert(attempt.data.message || '❌ Email already in use. Please log in.');
          location.hash = '#login';
          return;
        }

        if (attempt.res.status === 401 || attempt.res.status === 403) {
          alert(attempt.data.message || '❌ Signup blocked by auth. Check backend to allow public signup.');
          return;
        }

        if (attempt.res.status === 404) {
          alert('❌ Signup endpoint not found. Confirm your backend route (/api/register or /api/signup).');
          return;
        }

        alert((attempt.data && (attempt.data.error || attempt.data.message)) || ('Signup failed (status ' + attempt.res.status + ').'));
      } catch (err) {
        console.error(err);
        alert('❌ Signup error. Try again.');
      } finally {
        if (registerLoader) registerLoader.style.display = 'none';
        if (signupBtn) signupBtn.disabled = false;
      }
    });
  }

  /* ===== LOGIN (left simple and separate) ===== */
  var loginForm = $('#login-form');
  var loginLoader = $('#loginLoader');
  var loginBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var emailEl = $('#login-email');
      var passwordEl = $('#login-password');
      var email = (emailEl && emailEl.value || '').trim().toLowerCase();
      var password = (passwordEl && passwordEl.value || '');
      if (!email || !password) { alert('❌ Please enter email and password.'); return; }

      if (loginLoader) loginLoader.style.display = 'block';
      if (loginBtn) loginBtn.disabled = true;

      try {
        var result = await jsonFetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });

        if (result.res.ok && result.data && result.data.token) {
          setToken(result.data.token);
          location.href = 'dashboard.html';
          return;
        }

        if (result.res.status === 404) {
          alert('❌ Login endpoint not found. Check /api/login on backend.');
          return;
        }

        alert((result.data && (result.data.error || result.data.message)) || ('Login failed (status ' + result.res.status + ').'));
      } catch (err) {
        console.error(err);
        alert('❌ Login error. Try again.');
      } finally {
        if (loginLoader) loginLoader.style.display = 'none';
        if (loginBtn) loginBtn.disabled = false;
      }
    });
  }
});
