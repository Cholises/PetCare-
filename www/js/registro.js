// // js/registro.js
// document.addEventListener('DOMContentLoaded', () => {

//     const form = document.getElementById('registroForm');
//     const nombre = document.getElementById('nombre');
//     const apellido = document.getElementById('apellido');
//     const correo = document.getElementById('correo');
//     const telefono = document.getElementById('telefono');
//     const contrasena = document.getElementById('contrasena');
//     const confirmarContrasena = document.getElementById('confirmarContrasena');
//     const terminosCheck = document.getElementById('terminosCheck');
//     const btnRegistro = document.getElementById('btnRegistro');

//     const passBar = document.getElementById('passBar');
//     const passText = document.getElementById('passText');

//     // Mostrar/Ocultar contraseña
//     document.getElementById('togglePass').addEventListener('click', () => {
//         const icon = document.querySelector('#togglePass i');
//         if (contrasena.type === 'password') {
//             contrasena.type = 'text';
//             icon.classList.remove('fa-eye');
//             icon.classList.add('fa-eye-slash');
//         } else {
//             contrasena.type = 'password';
//             icon.classList.add('fa-eye');
//             icon.classList.remove('fa-eye-slash');
//         }
//     });

//     // ===== VALIDACIONES ===== //
//     function validarEmail(email) {
//         const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return re.test(email.toLowerCase());
//     }

//     function validarTelefonoMX(tel) {
//         return /^\d{10}$/.test(tel);
//     }

//     function evaluarFuerza(pw) {
//         if (pw.length === 0) {
//             passText.classList.add('hidden');
//             passBar.className = 'pass-bar';
//             return;
//         }

//         if (passText.classList.contains('hidden')) passText.classList.remove('hidden');

//         let fuerza = 0;
//         if (pw.length >= 8) fuerza++;
//         if (/[0-9]/.test(pw)) fuerza++;
//         if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) fuerza++;

//         if (fuerza === 1) {
//             passBar.className = 'pass-bar pass-weak';
//             passText.textContent = "Básica";
//             passText.style.color = "#EF4444";
//         } else if (fuerza === 2) {
//             passBar.className = 'pass-bar pass-medium';
//             passText.textContent = "Recomendable";
//             passText.style.color = "#F59E0B";
//         } else {
//             passBar.className = 'pass-bar pass-strong';
//             passText.textContent = "Segura";
//             passText.style.color = "#10B981";
//         }
//     }

//     contrasena.addEventListener('input', e => {
//         evaluarFuerza(e.target.value);
//         validarFormulario();
//     });

//     confirmarContrasena.addEventListener('input', validarFormulario);
//     nombre.addEventListener('input', validarFormulario);
//     apellido.addEventListener('input', validarFormulario);
//     correo.addEventListener('input', validarFormulario);
//     telefono.addEventListener('input', () => {
//         telefono.value = telefono.value.replace(/\D/g, '').slice(0, 10);
//         validarFormulario();
//     });
//     terminosCheck.addEventListener('change', validarFormulario);

//     function validarFormulario() {
//         const camposLlenos = 
//             nombre.value.trim() !== "" &&
//             apellido.value.trim() !== "" &&
//             correo.value.trim() !== "" &&
//             telefono.value.trim() !== "" &&
//             contrasena.value.trim() !== "" &&
//             confirmarContrasena.value.trim() !== "";

//         const emailOK = validarEmail(correo.value);
//         const phoneOK = validarTelefonoMX(telefono.value);
//         const passOK = contrasena.value.length >= 8;
//         const matchOK = contrasena.value === confirmarContrasena.value;
//         const terminosOK = terminosCheck.checked;

//         const todoBien = camposLlenos && emailOK && phoneOK && passOK && matchOK && terminosOK;
//         btnRegistro.disabled = !todoBien;
//         return todoBien;
//     }

//     // ===== SUBMIT ===== //
//     form.addEventListener('submit', e => {
//         e.preventDefault();
//         if (!validarFormulario()) {
//             alert("Por favor completa los datos correctamente.");
//             return;
//         }

//         const usuario = {
//             id: "u_" + Date.now(),
//             nombre: nombre.value.trim(),
//             apellido: apellido.value.trim(),
//             nombreCompleto: `${nombre.value.trim()} ${apellido.value.trim()}`,
//             email: correo.value.trim().toLowerCase(), // 👈 cambiado a 'email' para coincidir con login.js
//             telefono: telefono.value.trim(),
//             password: contrasena.value.trim(), // 👈 se guarda directamente
//             creado: new Date().toISOString()
//         };

//         // Guardar usuario
//         const users = JSON.parse(localStorage.getItem("users") || "[]");
//         users.push(usuario);
//         localStorage.setItem("users", JSON.stringify(users));

//         // Guardar usuario activo
//         localStorage.setItem("currentUser", JSON.stringify(usuario));

//         // Redirigir a pantalla final
//         window.location.href = "creado.html";
//     });

// });

// js/registro.js - VERSIÓN PROFESIONAL CON PREVENCIÓN DE CARACTERES
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registroForm');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const correo = document.getElementById('correo');
    const telefono = document.getElementById('telefono');
    const contrasena = document.getElementById('contrasena');
    const confirmarContrasena = document.getElementById('confirmarContrasena');
    const terminosCheck = document.getElementById('terminosCheck');
    const btnRegistro = document.getElementById('btnRegistro');

    const passBar = document.getElementById('passBar');
    const passText = document.getElementById('passText');

    // ===== PREVENCIÓN DE CARACTERES NO PERMITIDOS ===== //

    // NOMBRE y APELLIDO: Solo letras, espacios y acentos
    function filtrarNombre(e) {
        const char = e.key;
        const valor = e.target.value;
        
        // Permitir teclas de control
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || 
            char === 'ArrowLeft' || char === 'ArrowRight' || char === 'Home' || char === 'End') {
            return;
        }
        
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        // Solo permitir letras, espacios y acentos
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(char)) {
            e.preventDefault();
        }
        
        // No permitir más de un espacio seguido
        if (char === ' ' && valor.endsWith(' ')) {
            e.preventDefault();
        }
        
        // No permitir espacio al inicio
        if (char === ' ' && valor.length === 0) {
            e.preventDefault();
        }
    }

    // CORREO: Prevenir espacios y caracteres inválidos
    function filtrarCorreo(e) {
        const char = e.key;
        
        // Permitir teclas de control
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || 
            char === 'ArrowLeft' || char === 'ArrowRight' || char === 'Home' || char === 'End') {
            return;
        }
        
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        // NO PERMITIR ESPACIOS
        if (char === ' ') {
            e.preventDefault();
            return;
        }
        
        // Solo permitir caracteres válidos en email: letras, números, @, ., _, -
        if (!/^[a-zA-Z0-9@._-]$/.test(char)) {
            e.preventDefault();
        }
    }

    // CONTRASEÑA: Prevenir espacios (permitir todo lo demás)
    function filtrarContrasena(e) {
        const char = e.key;
        
        // Permitir teclas de control
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || 
            char === 'ArrowLeft' || char === 'ArrowRight' || char === 'Home' || char === 'End') {
            return;
        }
        
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        // NO PERMITIR ESPACIOS
        if (char === ' ') {
            e.preventDefault();
            return;
        }
    }

    // Aplicar filtros a los campos
    nombre.addEventListener('keydown', filtrarNombre);
    apellido.addEventListener('keydown', filtrarNombre);
    correo.addEventListener('keydown', filtrarCorreo);
    contrasena.addEventListener('keydown', filtrarContrasena);
    confirmarContrasena.addEventListener('keydown', filtrarContrasena);

    // Prevenir pegado de contenido inválido
    nombre.addEventListener('paste', (e) => limpiarPegadoNombre(e));
    apellido.addEventListener('paste', (e) => limpiarPegadoNombre(e));
    correo.addEventListener('paste', (e) => limpiarPegadoCorreo(e));
    contrasena.addEventListener('paste', (e) => limpiarPegadoContrasena(e));
    confirmarContrasena.addEventListener('paste', (e) => limpiarPegadoContrasena(e));

    function limpiarPegadoNombre(e) {
        e.preventDefault();
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        const limpio = texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, ' ').trim();
        document.execCommand('insertText', false, limpio);
    }

    function limpiarPegadoCorreo(e) {
        e.preventDefault();
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        const limpio = texto.replace(/\s/g, '').replace(/[^a-zA-Z0-9@._-]/g, '');
        document.execCommand('insertText', false, limpio);
    }

    function limpiarPegadoContrasena(e) {
        e.preventDefault();
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        const limpio = texto.replace(/\s/g, ''); // Solo quitar espacios
        document.execCommand('insertText', false, limpio);
    }

    // ===== MOSTRAR/OCULTAR CONTRASEÑA ===== //
    document.getElementById('togglePass').addEventListener('click', () => {
        const icon = document.querySelector('#togglePass i');
        if (contrasena.type === 'password') {
            contrasena.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            contrasena.type = 'password';
            icon.classList.add('fa-eye');
            icon.classList.remove('fa-eye-slash');
        }
    });

    // ===== FUNCIONES DE VALIDACIÓN ===== //

    function validarEmail(email) {
        const emailLimpio = email.trim();
        
        if (/\s/.test(emailLimpio)) {
            return { valido: false, mensaje: "El correo no puede contener espacios" };
        }
        
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(emailLimpio)) {
            return { valido: false, mensaje: "Formato de correo inválido" };
        }
        
        return { valido: true, email: emailLimpio };
    }

    function emailYaExiste(email) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    function validarTelefonoMX(tel) {
        return /^[2-9]\d{9}$/.test(tel);
    }

    function validarNombre(texto) {
        const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
        return re.test(texto.trim());
    }

    function validarLongitudNombre(texto) {
        const limpio = texto.trim();
        return limpio.length >= 2 && limpio.length <= 50;
    }

    function evaluarFuerza(pw) {
        if (pw.length === 0) {
            passText.classList.add('hidden');
            passBar.className = 'pass-bar';
            return 0;
        }

        if (passText.classList.contains('hidden')) passText.classList.remove('hidden');

        let fuerza = 0;
        
        if (pw.length >= 8) fuerza++;
        if (pw.length >= 12) fuerza++;
        if (/[a-z]/.test(pw)) fuerza++;
        if (/[A-Z]/.test(pw)) fuerza++;
        if (/[0-9]/.test(pw)) fuerza++;
        if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pw)) fuerza++;

        let nivel = 0;
        if (fuerza <= 2) {
            nivel = 1;
            passBar.className = 'pass-bar pass-weak';
            passText.textContent = "Básica - Usa mayúsculas, números y símbolos";
            passText.style.color = "#EF4444";
        } else if (fuerza <= 4) {
            nivel = 2;
            passBar.className = 'pass-bar pass-medium';
            passText.textContent = "Recomendable - Agrega caracteres especiales";
            passText.style.color = "#F59E0B";
        } else {
            nivel = 3;
            passBar.className = 'pass-bar pass-strong';
            passText.textContent = "Segura ✓";
            passText.style.color = "#10B981";
        }
        
        return nivel;
    }

    function validarContrasena(pw) {
        const errores = [];
        
        if (pw.length < 8) {
            errores.push("Mínimo 8 caracteres");
        }
        
        if (pw.length > 128) {
            errores.push("Máximo 128 caracteres");
        }
        
        if (!/[0-9]/.test(pw)) {
            errores.push("Debe incluir al menos un número");
        }
        
        if (!/[a-z]/.test(pw)) {
            errores.push("Debe incluir al menos una minúscula");
        }
        
        if (!/[A-Z]/.test(pw)) {
            errores.push("Debe incluir al menos una mayúscula");
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pw)) {
            errores.push("Debe incluir al menos un carácter especial");
        }
        
        if (/\s/.test(pw)) {
            errores.push("No puede contener espacios");
        }
        
        const patronesDebiles = [
            /^123456/, /password/i, /qwerty/i, /abc123/i, 
            /111111/, /12345678/, /admin/i
        ];
        
        for (let patron of patronesDebiles) {
            if (patron.test(pw)) {
                errores.push("Contraseña muy común");
                break;
            }
        }
        
        return errores;
    }

    function mostrarError(input, mensaje) {
        const errorPrevio = input.parentElement.querySelector('.error-message');
        if (errorPrevio) errorPrevio.remove();

        input.parentElement.classList.add('input-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        input.parentElement.appendChild(errorDiv);
    }

    function mostrarErrorTemporal(input, mensaje) {
        const errorPrevio = input.parentElement.querySelector('.error-temporal');
        if (errorPrevio) return; // Ya hay un error temporal

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message error-temporal';
        errorDiv.innerHTML = `<i class="fas fa-ban"></i> ${mensaje}`;
        input.parentElement.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 2000);
    }

    function limpiarError(input) {
        const errorMsg = input.parentElement.querySelector('.error-message:not(.error-temporal)');
        if (errorMsg) errorMsg.remove();
        input.parentElement.classList.remove('input-error');
    }

    // ===== EVENT LISTENERS ===== //

    nombre.addEventListener('blur', () => {
        const valor = nombre.value.trim();
        if (valor === "") {
            limpiarError(nombre);
        } else if (!validarNombre(valor)) {
            mostrarError(nombre, "Solo letras y espacios (2-50 caracteres)");
        } else if (!validarLongitudNombre(valor)) {
            mostrarError(nombre, "Entre 2 y 50 caracteres");
        } else {
            limpiarError(nombre);
        }
        validarFormulario();
    });

    nombre.addEventListener('input', () => {
        limpiarError(nombre);
        validarFormulario();
    });

    apellido.addEventListener('blur', () => {
        const valor = apellido.value.trim();
        if (valor === "") {
            limpiarError(apellido);
        } else if (!validarNombre(valor)) {
            mostrarError(apellido, "Solo letras y espacios (2-50 caracteres)");
        } else if (!validarLongitudNombre(valor)) {
            mostrarError(apellido, "Entre 2 y 50 caracteres");
        } else {
            limpiarError(apellido);
        }
        validarFormulario();
    });

    apellido.addEventListener('input', () => {
        limpiarError(apellido);
        validarFormulario();
    });

    correo.addEventListener('blur', () => {
        const valor = correo.value;
        
        if (valor === "") {
            limpiarError(correo);
            return;
        }
        
        const resultadoValidacion = validarEmail(valor);
        
        if (!resultadoValidacion.valido) {
            mostrarError(correo, resultadoValidacion.mensaje);
        } else if (emailYaExiste(resultadoValidacion.email)) {
            mostrarError(correo, "Este correo ya está registrado");
        } else {
            correo.value = resultadoValidacion.email;
            limpiarError(correo);
        }
        validarFormulario();
    });

    correo.addEventListener('input', () => {
        limpiarError(correo);
        validarFormulario();
    });

    telefono.addEventListener('input', () => {
        telefono.value = telefono.value.replace(/\D/g, '').slice(0, 10);
        limpiarError(telefono);
        validarFormulario();
    });

    telefono.addEventListener('blur', () => {
        const valor = telefono.value.trim();
        if (valor === "") {
            limpiarError(telefono);
        } else if (!validarTelefonoMX(valor)) {
            if (valor.length !== 10) {
                mostrarError(telefono, "Debe tener exactamente 10 dígitos");
            } else {
                mostrarError(telefono, "Número inválido (no puede empezar con 0 o 1)");
            }
        } else {
            limpiarError(telefono);
        }
        validarFormulario();
    });

    contrasena.addEventListener('input', e => {
        evaluarFuerza(e.target.value);
        limpiarError(contrasena);
        
        if (confirmarContrasena.value !== "") {
            limpiarError(confirmarContrasena);
        }
        
        validarFormulario();
    });

    contrasena.addEventListener('blur', () => {
        const valor = contrasena.value;
        if (valor === "") {
            limpiarError(contrasena);
        } else {
            const errores = validarContrasena(valor);
            if (errores.length > 0) {
                mostrarError(contrasena, errores[0]);
            } else {
                limpiarError(contrasena);
            }
        }
        validarFormulario();
    });

    confirmarContrasena.addEventListener('input', () => {
        limpiarError(confirmarContrasena);
        validarFormulario();
    });

    confirmarContrasena.addEventListener('blur', () => {
        const valor = confirmarContrasena.value;
        if (valor === "") {
            limpiarError(confirmarContrasena);
        } else if (valor !== contrasena.value) {
            mostrarError(confirmarContrasena, "Las contraseñas no coinciden");
        } else {
            limpiarError(confirmarContrasena);
        }
        validarFormulario();
    });

    terminosCheck.addEventListener('change', validarFormulario);

    // ===== VALIDACIÓN GENERAL DEL FORMULARIO ===== //
    function validarFormulario() {
        const nombreVal = nombre.value.trim();
        const apellidoVal = apellido.value.trim();
        const correoVal = correo.value.trim();
        const telefonoVal = telefono.value.trim();
        const contrasenaVal = contrasena.value;
        const confirmarVal = confirmarContrasena.value;

        const camposLlenos = 
            nombreVal !== "" &&
            apellidoVal !== "" &&
            correoVal !== "" &&
            telefonoVal !== "" &&
            contrasenaVal !== "" &&
            confirmarVal !== "";

        if (!camposLlenos) {
            btnRegistro.disabled = true;
            return false;
        }

        const nombreOK = validarNombre(nombreVal) && validarLongitudNombre(nombreVal);
        const apellidoOK = validarNombre(apellidoVal) && validarLongitudNombre(apellidoVal);
        
        const emailValidacion = validarEmail(correoVal);
        const emailOK = emailValidacion.valido && !emailYaExiste(emailValidacion.valido ? emailValidacion.email : correoVal);
        
        const phoneOK = validarTelefonoMX(telefonoVal);
        const passOK = validarContrasena(contrasenaVal).length === 0;
        const matchOK = contrasenaVal === confirmarVal;
        const terminosOK = terminosCheck.checked;

        const todoBien = nombreOK && apellidoOK && emailOK && phoneOK && passOK && matchOK && terminosOK;
        
        btnRegistro.disabled = !todoBien;
        return todoBien;
    }

    // ===== FUNCIÓN DE HASH ===== //
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // ===== SUBMIT DEL FORMULARIO ===== //
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            alert("Por favor completa todos los campos correctamente.");
            return;
        }

        btnRegistro.disabled = true;
        btnRegistro.innerHTML = '<span class="btn-text">Creando cuenta...</span>';

        try {
            const hashedPassword = await hashPassword(contrasena.value.trim());

            const usuario = {
                id: "u_" + Date.now(),
                nombre: nombre.value.trim(),
                apellido: apellido.value.trim(),
                nombreCompleto: `${nombre.value.trim()} ${apellido.value.trim()}`,
                email: correo.value.trim().toLowerCase(),
                telefono: telefono.value.trim(),
                password: hashedPassword,
                creado: new Date().toISOString(),
                activo: true,
                intentosFallidos: 0
            };

            const users = JSON.parse(localStorage.getItem("users") || "[]");
            
            if (users.some(u => u.email === usuario.email)) {
                alert("Este correo ya está registrado.");
                btnRegistro.disabled = false;
                btnRegistro.innerHTML = '<span class="btn-text">Crear cuenta</span><i class="fas fa-arrow-right"></i>';
                return;
            }

            users.push(usuario);
            localStorage.setItem("users", JSON.stringify(users));

            const currentUser = {...usuario};
            delete currentUser.password;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            // Crear sesión activa para evitar alerta de sesión expirada
            const userSession = {
                sessionActive: true,
                loginTime: new Date().toISOString(),
                userId: usuario.id
            };
            localStorage.setItem("userSession", JSON.stringify(userSession));

            window.location.href = "menu.html";

        } catch (error) {
            console.error("Error al crear cuenta:", error);
            alert("Ocurrió un error al crear tu cuenta. Por favor intenta de nuevo.");
            btnRegistro.disabled = false;
            btnRegistro.innerHTML = '<span class="btn-text">Crear cuenta</span><i class="fas fa-arrow-right"></i>';
        }
    });

});