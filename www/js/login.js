// js/login.js

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const togglePassword = document.getElementById("togglePassword");
    

    // ==== Mostrar / Ocultar Contraseña ====
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        togglePassword.querySelector("i").classList.toggle("fa-eye");
        togglePassword.querySelector("i").classList.toggle("fa-eye-slash");
    });

    // ==== Auto-completar si se activó "Recordarme" ====
    const savedLogin = JSON.parse(localStorage.getItem("rememberedLogin"));
    if (savedLogin) {
        emailInput.value = savedLogin.email;
        passwordInput.value = savedLogin.password;
        rememberMe.checked = true;
    }

    // ==== Inicio de Sesión ====
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Obtener usuarios guardados
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        // Buscar usuario que coincida
        const userFound = users.find(user => user.email === email && user.password === password);

        if (!userFound) {
            alert("Correo o contraseña incorrectos");
            return;
        }

        // Guardar usuario logueado
        localStorage.setItem("currentUser", JSON.stringify(userFound));

        // Guardar “Recordarme” si está marcado
        if (rememberMe.checked) {
            localStorage.setItem("rememberedLogin", JSON.stringify({ email, password }));
        } else {
            localStorage.removeItem("rememberedLogin");
        }

        // Redirigir al menú
        window.location.href = "menu.html";
    });

});
