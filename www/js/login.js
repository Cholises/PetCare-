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

            // Deshabilitar botón
            const btnSubmit = loginForm.querySelector('.btn-login');
            const textoOriginal = btnSubmit.querySelector('.btn-text').textContent;
            btnSubmit.disabled = true;
            btnSubmit.querySelector('.btn-text').textContent = 'Iniciando sesión...';

            (async () => {
                try {
                    // Llamar a la API
                    const response = await api.login(email, password);

                    // Guardar usuario logueado
                    localStorage.setItem("currentUser", JSON.stringify(response.usuario));

                    // Guardar "Recordarme" si está marcado
                    if (rememberMe.checked) {
                        localStorage.setItem("rememberedLogin", JSON.stringify({ email, password }));
                    } else {
                        localStorage.removeItem("rememberedLogin");
                    }

                    // Mostrar éxito y redirigir
                    alert(`¡Bienvenido ${response.usuario.nombre}!`);
                    window.location.href = "menu.html";

                } catch (error) {
                    console.error('Error en login:', error);
                    alert(error.message || "Correo o contraseña incorrectos");
                
                    // Restaurar botón
                    btnSubmit.disabled = false;
                    btnSubmit.querySelector('.btn-text').textContent = textoOriginal;
                }
            })();
    });

});
