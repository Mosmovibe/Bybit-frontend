// ---- Config / API origin (prefer window.APP_CONFIG.API_URL if present) ----
let API_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_URL) ||
  "https://bybit-backend-xeuv.onrender.com";

// Normalize API_URL to just scheme://host[:port]
try {
  const u = new URL(API_URL);
  API_URL = `${u.protocol}//${u.host}`;
} catch {
  console.warn("API_URL is not a valid URL origin. Using as-is:", API_URL);
}

// ---------------- Utilities ----------------
function buildURL(path) {
  const p = String(path || "");
  return `${API_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function getToken() {
  try {
    const t = localStorage.getItem("token");
    return t && t.trim() ? t : null;
  } catch {
    return null;
  }
}

function handleSessionExpired() {
  alert("Your session has expired. Please log in again.");
  try { localStorage.removeItem("token"); } catch {}
  window.location.href = "/login.html";
}

function setText(selectorOrEl, value) {
  const el =
    typeof selectorOrEl === "string"
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;
  if (el) el.textContent = value ?? "";
}

function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.value = value ?? "";
}

function setImgSrc(selectorOrEl, src, fallback) {
  const el =
    typeof selectorOrEl === "string"
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;
  if (!el) return;
  const url = src || fallback || el.src || "";
  // cache-bust so users see the latest upload immediately
  const bust = url ? (url.includes("?") ? "&" : "?") + "t=" + Date.now() : "";
  el.src = url + bust;
}

function toNumber(n, def = 0) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : def;
}

function money(n) {
  return toNumber(n).toFixed(2);
}

// ---- Centralized fetch helpers (CORS-aware, better errors) ----
async function apiRequest(path, options = {}) {
  const token = getToken();
  if (!token) return handleSessionExpired();

  const init = {
    method: "GET",
    mode: "cors",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    ...options,
  };

  const res = await fetch(buildURL(path), init);

  // 401/403 -> treat as expired/unauthorized
  if (res.status === 401 || res.status === 403) {
    return handleSessionExpired();
  }

  // try parse JSON (may fail on 204)
  let data = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = data?.error || `${init.method || "GET"} ${path} failed`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}

async function apiPostForm(path, formData) {
  return apiRequest(path, {
    method: "POST",
    // DO NOT set Content-Type when sending FormData
    body: formData,
  });
}

async function apiPostJSON(path, body) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

/* ---------------- State ---------------- */
let CURRENT_USER = null; // {_id, email, investmentPlan, amountInvested, isAdmin, ...}
let IS_ADMIN = false;

/* --------------- Page wiring --------------- */
async function loadProfile() {
  try {
    const data = await apiGet("/api/dashboard");
    if (!data) return;

    CURRENT_USER = data;
    IS_ADMIN = !!data.isAdmin;

    // Identity
    setText("#fullName", data.fullname || data.name || "");
    setText("#email", data.email || "");

    // Plan & investment
    const plan = data.investmentPlan ?? "Free";
    const amount = data.amountInvested ?? 0;
    setText("#investmentPlan .plan-value", plan);
    setText("#amountInvested .amount-value", money(amount));

    // Prefill inputs (if present)
    setValue("#planInput", plan);
    setValue("#amountInput", toNumber(amount));

    // Balances
    setText("#balance", money(data.balance || data.totalBalance || 0));
    setText("#availableBalance", money(data.availableBalance || 0));
    setText("#profit", money(data.profit || 0));

    // Package fallback
    setText("#package", data.package || plan);

    // Profile picture
    const imgUrl = data.profilePic || data.profileImage || "images/profile.png";
    setImgSrc("#profilePic", imgUrl, "images/profile.png");

    // Admin-only section
    const updateSection = document.getElementById("updateSection");
    if (updateSection) updateSection.style.display = IS_ADMIN ? "block" : "none";
  } catch (err) {
    console.error("[loadProfile]", err);
    alert("Failed to load profile. Please refresh.");
  }
}

/**
 * ADMIN-ONLY: update plan/amount via /api/admin/update-user
 */
async function updatePlanAndAmount() {
  const msgEl = document.getElementById("updateMsg");
  const plan = (document.getElementById("planInput")?.value || "").trim();
  const amountRaw = document.getElementById("amountInput")?.value;
  const amount = toNumber(amountRaw, NaN);

  if (!IS_ADMIN) {
    if (msgEl) { msgEl.textContent = "Admin only."; msgEl.style.color = "red"; }
    return;
  }
  if (!plan) {
    if (msgEl) { msgEl.textContent = "Please enter a plan name."; msgEl.style.color = "red"; }
    return;
  }
  if (!Number.isFinite(amount)) {
    if (msgEl) { msgEl.textContent = "Please enter a valid number for Amount Invested."; msgEl.style.color = "red"; }
    return;
  }

  const userId = CURRENT_USER?._id || CURRENT_USER?.id || CURRENT_USER?.userId;
  if (!userId) {
    if (msgEl) { msgEl.textContent = "Could not find current user id for admin update."; msgEl.style.color = "red"; }
    return;
  }

  if (msgEl) { msgEl.textContent = "Saving…"; msgEl.style.color = ""; }

  try {
    const res = await apiPostJSON("/api/admin/update-user", {
      userId,
      investmentPlan: plan,
      amountInvested: amount,
    });

    // Reflect immediately
    const newPlan = res.user?.investmentPlan ?? plan;
    const newAmt = res.user?.amountInvested ?? amount;

    setText("#investmentPlan .plan-value", newPlan);
    setText("#amountInvested .amount-value", money(newAmt));
    setValue("#planInput", newPlan);
    setValue("#amountInput", toNumber(newAmt));

    if (msgEl) { msgEl.textContent = "Updated!"; msgEl.style.color = "green"; }
  } catch (e) {
    console.error("Admin update failed:", e);
    if (msgEl) { msgEl.textContent = e.message || "Update failed."; msgEl.style.color = "red"; }
  }
}

async function uploadProfilePic(e) {
  e?.preventDefault?.();

  const fileInput = document.getElementById("uploadProfilePic");
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("Please choose an image first.");
    return;
  }

  const formData = new FormData();
  formData.append("profilePic", fileInput.files[0]);

  try {
    const data = await apiPostForm("/api/upload-profile", formData);
    if (!data) return;

    const newUrl =
      data.profilePicUrl || data.url || data.profilePic || data.profileImage;

    if (!newUrl) {
      alert("Upload reported success but returned no image URL.");
      return;
    }

    setImgSrc("#profilePic", newUrl, "images/profile.png");
    alert("Profile picture updated!");
  } catch (err) {
    console.error("[uploadProfilePic]", err);
    alert(err.message || "Upload failed. Please try again.");
  }
}

/* --------------- Event listeners --------------- */
function wireEvents() {
  // Upload button
  const uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn) uploadBtn.addEventListener("click", uploadProfilePic);

  // Admin: Update plan/amount
  const savePlanBtn = document.getElementById("savePlanBtn");
  if (savePlanBtn) savePlanBtn.addEventListener("click", updatePlanAndAmount);

  // Optional: auto-upload when a file is chosen
  const fileInput = document.getElementById("uploadProfilePic");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      // To auto-upload on select, uncomment the next line:
      // uploadProfilePic();
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      try { localStorage.removeItem("token"); } catch {}
      window.location.href = "/login.html";
    });
  }
}

// Kickoff when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  wireEvents();
  // If this script is used on the dashboard page, load the profile.
  // It’s safe to call on non-dashboard pages; the /api call will still work
  // if a token exists, otherwise you’ll be redirected by the API helpers.
  loadProfile();
});
