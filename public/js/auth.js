// public/js/auth.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const forgotForm = document.getElementById("forgotForm");

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target.email.value.trim();
            const password = e.target.password.value.trim();

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                TasteBase.setSession(data.token, data.email);
                window.location = "home.html";
            } else {
                alert(data.error || "Login failed");
            }
        });
    }

    // SIGNUP
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target.email.value.trim();
            const password = e.target.password.value.trim();
            const confirm = e.target.confirm.value.trim();
            if (password !== confirm) {
                alert("Passwords must match");
                return;
            }

            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Account created. Please log in.");
                window.location = "login.html";
            } else {
                alert(data.error || "Signup failed");
            }
        });
    }

    // FORGOT
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target.email.value.trim();

            const res = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            alert(data.message || "If an account exists, a reset link has been sent.");
        });
    }
});
