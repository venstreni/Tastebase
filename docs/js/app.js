// public/js/app.js
// shared helpers for all pages

const API_BASE = "https://tastebase.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

function getEmail() {
  return localStorage.getItem("email");
}

function setSession(token, email) {
  localStorage.setItem("token", token);
  if (email) localStorage.setItem("email", email);
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
}

function requireAuth() {
  if (!getToken()) {
    window.location = "login.html";
  }
}

// inject topbar
function renderTopbar() {
    const email = getEmail();
    const isLoggedIn = !!getToken();

    const top = document.createElement("header");
    top.className = "topbar";
    top.innerHTML = `
    <div class="topbar-left" id="logoClickable" style="cursor:pointer;">
      <div class="logo-circle">T</div>
      <div class="app-name">TasteBase</div>
    </div>
    <div class="topbar-right">
      ${isLoggedIn ? `<span>${email}</span><button class="btn-outline" id="logoutBtn">Sign out</button>` : `
        <a href="login.html" class="btn">Log In</a>
        <a href="signup.html" class="btn">Sign Up</a>
      `}
    </div>
  `;
    document.body.prepend(top);

    // Logo click navigation rule
    document.getElementById("logoClickable").addEventListener("click", () => {
        if (isLoggedIn) {
            window.location = "home.html";
        } else {
            window.location = "index.html";
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearSession();
            window.location = "index.html";
        });
    }
}


async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // token expired
    clearSession();
    window.location = "login.html";
    return;
  }
  return res;
}

window.TasteBase = {
  getToken,
  getEmail,
  setSession,
  clearSession,
  renderTopbar,
  apiFetch,
  requireAuth
};
