// // js/login.js

// document.addEventListener("DOMContentLoaded", () => {

//     const loginForm = document.getElementById("loginForm");
//     const emailInput = document.getElementById("email");
//     const passwordInput = document.getElementById("password");
//     const rememberMe = document.getElementById("rememberMe");
//     const togglePassword = document.getElementById("togglePassword");
    

//     // ==== Mostrar / Ocultar Contraseña ====
//     togglePassword.addEventListener("click", () => {
//         const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
//         passwordInput.setAttribute("type", type);
//         togglePassword.querySelector("i").classList.toggle("fa-eye");
//         togglePassword.querySelector("i").classList.toggle("fa-eye-slash");
//     });

//     // ==== Auto-completar si se activó "Recordarme" ====
//     const savedLogin = JSON.parse(localStorage.getItem("rememberedLogin"));
//     if (savedLogin) {
//         emailInput.value = savedLogin.email;
//         passwordInput.value = savedLogin.password;
//         rememberMe.checked = true;
//     }

//     // ==== Inicio de Sesión ====
//     loginForm.addEventListener("submit", (e) => {
//         e.preventDefault();

//         const email = emailInput.value.trim();
//         const password = passwordInput.value.trim();

//         // Obtener usuarios guardados
//         const users = JSON.parse(localStorage.getItem("users") || "[]");

//         // Buscar usuario que coincida
//         const userFound = users.find(user => user.email === email && user.password === password);

//         if (!userFound) {
//             alert("Correo o contraseña incorrectos");
//             return;
//         }

//         // Normalizar campos del usuario (asegurar `correo` además de `email`)
//         userFound.correo = userFound.correo || userFound.email || null;
//         userFound.email = userFound.email || userFound.correo || null;
//         userFound.nombre = userFound.nombre || userFound.name || (userFound.nombreCompleto || '').split(' ')[0] || '';

//         // Guardar usuario logueado
//         localStorage.setItem("currentUser", JSON.stringify(userFound));

//         // Guardar “Recordarme” si está marcado
//         if (rememberMe.checked) {
//             localStorage.setItem("rememberedLogin", JSON.stringify({ email, password }));
//         } else {
//             localStorage.removeItem("rememberedLogin");
//         }

//         // Redirigir al menú
//         window.location.href = "menu.html";
//     });

// });

// js/login.js - VERSIÓN SIMPLIFICADA SIN BLOQUEO

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const togglePassword = document.getElementById("togglePassword");
    const btnLogin = loginForm.querySelector(".btn-login");

    // ===== SISTEMA DE BLOQUEO POR INTENTOS FALLIDOS =====
    const MAX_INTENTOS = 5;
    const TIEMPO_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos en milisegundos
    
    function obtenerDatosBloqueo() {
        const datos = localStorage.getItem('loginBloqueo');
        if (!datos) return { intentos: 0, bloqueadoHasta: null };
        return JSON.parse(datos);
    }
    
    function guardarDatosBloqueo(intentos, bloqueadoHasta = null) {
        localStorage.setItem('loginBloqueo', JSON.stringify({ intentos, bloqueadoHasta }));
    }
    
    function verificarBloqueo() {
        const datos = obtenerDatosBloqueo();
        
        if (datos.bloqueadoHasta) {
            const ahora = new Date().getTime();
            const bloqueadoHasta = new Date(datos.bloqueadoHasta).getTime();
            
            if (ahora < bloqueadoHasta) {
                // Aún está bloqueado
                const tiempoRestante = Math.ceil((bloqueadoHasta - ahora) / 1000 / 60);
                return {
                    bloqueado: true,
                    minutos: tiempoRestante
                };
            } else {
                // El bloqueo expiró, resetear
                guardarDatosBloqueo(0, null);
                return { bloqueado: false };
            }
        }
        
        return { bloqueado: false };
    }
    
    function bloquearFormulario(minutos) {
        emailInput.disabled = true;
        passwordInput.disabled = true;
        btnLogin.disabled = true;
        if (rememberMe) rememberMe.disabled = true;
        if (togglePassword) togglePassword.disabled = true;
        
        // Actualizar el botón con contador
        actualizarContadorBloqueo(minutos);
    }
    
    function desbloquearFormulario() {
        emailInput.disabled = false;
        passwordInput.disabled = false;
        btnLogin.disabled = false;
        if (rememberMe) rememberMe.disabled = false;
        if (togglePassword) togglePassword.disabled = false;
        
        btnLogin.innerHTML = '<span class="btn-text">Iniciar Sesión</span> <i class="fas fa-arrow-right"></i>';
    }
    
    function actualizarContadorBloqueo(minutosRestantes) {
        const intervalo = setInterval(() => {
            const estadoBloqueo = verificarBloqueo();
            
            if (!estadoBloqueo.bloqueado) {
                clearInterval(intervalo);
                desbloquearFormulario();
                mostrarMensaje('✅ Formulario desbloqueado. Puedes intentar de nuevo.', 'login-success');
                return;
            }
            
            const mins = estadoBloqueo.minutos;
            const segs = Math.ceil(((new Date(obtenerDatosBloqueo().bloqueadoHasta).getTime() - new Date().getTime()) / 1000) % 60);
            
            btnLogin.innerHTML = `
                <i class="fas fa-lock"></i> 
                <span class="btn-text">Bloqueado: ${mins}:${segs.toString().padStart(2, '0')}</span>
            `;
        }, 1000);
    }
    
    function registrarIntentoFallido() {
        const datos = obtenerDatosBloqueo();
        const nuevosIntentos = datos.intentos + 1;
        
        if (nuevosIntentos >= MAX_INTENTOS) {
            // Bloquear formulario
            const bloqueadoHasta = new Date(new Date().getTime() + TIEMPO_BLOQUEO_MS);
            guardarDatosBloqueo(nuevosIntentos, bloqueadoHasta);
            
            bloquearFormulario(5);
            mostrarError(
                `🔒 Has superado el límite de ${MAX_INTENTOS} intentos fallidos. ` +
                `El formulario está bloqueado por 5 minutos.`
            );
        } else {
            guardarDatosBloqueo(nuevosIntentos, null);
            const intentosRestantes = MAX_INTENTOS - nuevosIntentos;
            mostrarError(
                `Correo o contraseña incorrectos. ` +
                `Te quedan ${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''}.`
            );
        }
    }
    
    function resetearIntentos() {
        guardarDatosBloqueo(0, null);
    }
    
    // Verificar si está bloqueado al cargar la página
    const estadoInicial = verificarBloqueo();
    if (estadoInicial.bloqueado) {
        bloquearFormulario(estadoInicial.minutos);
        mostrarError(
            `🔒 Formulario bloqueado por intentos fallidos. ` +
            `Podrás intentar de nuevo en ${estadoInicial.minutos} minuto${estadoInicial.minutos !== 1 ? 's' : ''}.`
        );
    }

    // ==== FUNCIÓN DE HASH (debe ser idéntica a la de registro.js) ====
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // ===== PREVENCIÓN DE CARACTERES NO PERMITIDOS ===== //
    
    // CORREO: Prevenir espacios
    function filtrarCorreo(e) {
        const char = e.key;
        
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || 
            char === 'ArrowLeft' || char === 'ArrowRight' || char === 'Home' || char === 'End') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        if (char === ' ') {
            e.preventDefault();
            mostrarErrorTemporal("No se permiten espacios en el correo");
            return;
        }
        
        if (!/^[a-zA-Z0-9@._-]$/.test(char)) {
            e.preventDefault();
            mostrarErrorTemporal("Carácter no válido");
        }
    }

    // CONTRASEÑA: Prevenir espacios
    function filtrarContrasena(e) {
        const char = e.key;
        
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || 
            char === 'ArrowLeft' || char === 'ArrowRight' || char === 'Home' || char === 'End') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        if (char === ' ') {
            e.preventDefault();
            mostrarErrorTemporal("No se permiten espacios en la contraseña");
        }
    }

    // Aplicar filtros
    emailInput.addEventListener('keydown', filtrarCorreo);
    passwordInput.addEventListener('keydown', filtrarContrasena);

    // Limpiar pegado
    emailInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        const limpio = texto.replace(/\s/g, '').replace(/[^a-zA-Z0-9@._-]/g, '');
        document.execCommand('insertText', false, limpio);
    });

    passwordInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        const limpio = texto.replace(/\s/g, '');
        document.execCommand('insertText', false, limpio);
    });

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
        if (rememberMe) rememberMe.checked = true;
    }

    // ==== Validación básica de campos ====
    function validarCampos() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (email === "" || password === "") {
            return { valido: false, mensaje: "Por favor completa todos los campos" };
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valido: false, mensaje: "Formato de correo inválido" };
        }
        
        // Verificar longitud mínima de contraseña
        if (password.length < 8) {
            return { valido: false, mensaje: "La contraseña debe tener al menos 8 caracteres" };
        }
        
        return { valido: true };
    }

    // ==== Mostrar error visual ====
    function mostrarError(mensaje, tipo = 'error') {
        const errorPrevio = loginForm.querySelector('.login-message');
        if (errorPrevio) errorPrevio.remove();

        const clase = tipo === 'success' ? 'login-success' : 'login-error';
        const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

        const errorDiv = document.createElement('div');
        errorDiv.className = `login-message ${clase}`;
        errorDiv.innerHTML = `<i class="fas ${icono}"></i> ${mensaje}`;
        
        btnLogin.parentElement.insertBefore(errorDiv, btnLogin);

        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    function mostrarErrorTemporal(mensaje) {
        const errorPrevio = loginForm.querySelector('.login-temporal');
        if (errorPrevio) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-message login-temporal';
        errorDiv.innerHTML = `<i class="fas fa-ban"></i> ${mensaje}`;
        errorDiv.style.cssText = 'margin-bottom: 12px; padding: 8px 12px; font-size: 13px;';
        
        btnLogin.parentElement.insertBefore(errorDiv, btnLogin);

        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.classList.add('removing');
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 2000);
    }

    // ==== Inicio de Sesión ====
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // ✅ Verificar si está bloqueado antes de procesar
        const estadoBloqueo = verificarBloqueo();
        if (estadoBloqueo.bloqueado) {
            mostrarError(
                `🔒 Formulario bloqueado. Intenta de nuevo en ${estadoBloqueo.minutos} minuto${estadoBloqueo.minutos !== 1 ? 's' : ''}.`
            );
            return;
        }

        // Validar campos
        const validacion = validarCampos();
        if (!validacion.valido) {
            mostrarError(validacion.mensaje);
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        console.log('🔐 Intento de login:', { email, passwordLength: password.length });

        // Deshabilitar botón durante el proceso
        btnLogin.disabled = true;
        const btnTextOriginal = btnLogin.innerHTML;
        btnLogin.innerHTML = '<span class="btn-text">Verificando...</span>';

        try {
            // Hash de la contraseña ingresada
            const hashedPassword = await hashPassword(password);
            console.log('🔑 Hash generado:', hashedPassword.substring(0, 20) + '...');

            // Obtener usuarios guardados
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            console.log('👥 Total usuarios en BD:', users.length);

            // Buscar usuario por email primero
            const userByEmail = users.find(user => user.email.toLowerCase() === email);
            if (userByEmail) {
                console.log('✅ Usuario encontrado por email');
                console.log('🔒 Hash guardado:', userByEmail.password.substring(0, 20) + '...');
                console.log('🔒 Hash ingresado:', hashedPassword.substring(0, 20) + '...');
                console.log('⚖️ Hashes coinciden:', userByEmail.password === hashedPassword);
            } else {
                console.log('❌ No se encontró usuario con email:', email);
            }

            // Buscar usuario que coincida (intentar con hash primero, luego con texto plano para retrocompatibilidad)
            let userFound = users.find(user => 
                user.email.toLowerCase() === email && 
                user.password === hashedPassword
            );

            // Si no se encuentra con hash, intentar con contraseña en texto plano (usuarios antiguos)
            if (!userFound) {
                console.log('⚠️ No se encontró con hash, intentando texto plano...');
                userFound = users.find(user => 
                    user.email.toLowerCase() === email && 
                    user.password === password
                );

                // Si se encontró con texto plano, actualizar a hash
                if (userFound) {
                    console.log('⚠️ Usuario con contraseña sin hash detectado, actualizando...');
                    userFound.password = hashedPassword;
                    const userIndex = users.findIndex(u => u.id === userFound.id);
                    if (userIndex !== -1) {
                        users[userIndex] = userFound;
                        localStorage.setItem("users", JSON.stringify(users));
                    }
                }
            }

            if (!userFound) {
                // ✅ Registrar intento fallido
                registrarIntentoFallido();
                
                btnLogin.disabled = false;
                btnLogin.innerHTML = btnTextOriginal;
                
                // Limpiar campos
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }
            
            // ✅ Login exitoso - resetear intentos
            resetearIntentos();

            // Verificar si la cuenta está activa
            if (userFound.activo === false) {
                mostrarError("Tu cuenta está desactivada. Contacta al soporte.");
                btnLogin.disabled = false;
                btnLogin.innerHTML = btnTextOriginal;
                return;
            }

            // ===== LOGIN EXITOSO ===== //

            // Actualizar último login
            userFound.ultimoLogin = new Date().toISOString();
            
            // Actualizar el usuario en el array de users
            const userIndex = users.findIndex(u => u.id === userFound.id);
            if (userIndex !== -1) {
                users[userIndex] = userFound;
                localStorage.setItem("users", JSON.stringify(users));
            }

            // Guardar usuario logueado (sin la contraseña)
            const currentUser = {...userFound};
            delete currentUser.password;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            
            // 🔐 CREAR SESIÓN PERSISTENTE (solo se limpia al hacer logout)
            localStorage.setItem("userSession", JSON.stringify({
                userId: currentUser.id,
                email: currentUser.email,
                loginTime: new Date().toISOString(),
                sessionActive: true
            }));

            // Guardar "Recordarme" si está marcado
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem("rememberedLogin", JSON.stringify({ 
                    email: email 
                }));
            } else {
                localStorage.removeItem("rememberedLogin");
            }

            // Mensaje de éxito
            btnLogin.innerHTML = '<span class="btn-text">¡Bienvenido!</span> <i class="fas fa-check"></i>';
            
            // Redirigir al menú
            setTimeout(() => {
                window.location.href = "menu.html";
            }, 500);

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            mostrarError("Ocurrió un error. Por favor intenta de nuevo.");
            btnLogin.disabled = false;
            btnLogin.innerHTML = btnTextOriginal;
        }
    });

    // ==== Validación en tiempo real ====
    emailInput.addEventListener('input', () => {
        const errorMsg = loginForm.querySelector('.login-error, .login-temporal');
        if (errorMsg && !errorMsg.classList.contains('login-warning')) {
            errorMsg.remove();
        }
    });

    passwordInput.addEventListener('input', () => {
        const errorMsg = loginForm.querySelector('.login-error, .login-temporal');
        if (errorMsg && !errorMsg.classList.contains('login-warning')) {
            errorMsg.remove();
        }
    });

});