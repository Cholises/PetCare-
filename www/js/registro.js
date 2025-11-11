// js/registro.js
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

    // Mostrar/Ocultar contraseña
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

    // ===== VALIDACIONES ===== //
    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    function validarTelefonoMX(tel) {
        return /^\d{10}$/.test(tel);
    }

    // function evaluarFuerza(pw) {
    //     if (pw.length === 0) {
    //         passText.classList.add('hidden');
    //         passBar.className = 'pass-bar';
    //         return;
    //     }

    //     if (passText.classList.contains('hidden')) passText.classList.remove('hidden');

    //     let fuerza = 0;
    //     if (pw.length >= 8) fuerza++;
    //     if (/[0-9]/.test(pw)) fuerza++;
    //     if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) fuerza++;

    //     if (fuerza === 1) {
    //         passBar.className = 'pass-bar pass-weak';
    //         passText.textContent = "Básica";
    //         passText.style.color = "#EF4444";
    //     } else if (fuerza === 2) {
    //         passBar.className = 'pass-bar pass-medium';
    //         passText.textContent = "Recomendable";
    //         passText.style.color = "#F59E0B";
    //     } else {
    //         passBar.className = 'pass-bar pass-strong';
    //         passText.textContent = "Segura";
    //         passText.style.color = "#10B981";
    //     }
    // }

    contrasena.addEventListener('input', e => {
        evaluarFuerza(e.target.value);
        validarFormulario();
    });

    confirmarContrasena.addEventListener('input', validarFormulario);
    nombre.addEventListener('input', validarFormulario);
    apellido.addEventListener('input', validarFormulario);
    correo.addEventListener('input', validarFormulario);
    telefono.addEventListener('input', () => {
        telefono.value = telefono.value.replace(/\D/g, '').slice(0, 10);
        validarFormulario();
    });
    terminosCheck.addEventListener('change', validarFormulario);

    function validarFormulario() {
        const camposLlenos = 
            nombre.value.trim() !== "" &&
            apellido.value.trim() !== "" &&
            correo.value.trim() !== "" &&
            telefono.value.trim() !== "" &&
            contrasena.value.trim() !== "" &&
            confirmarContrasena.value.trim() !== "";

        const emailOK = validarEmail(correo.value);
        const phoneOK = validarTelefonoMX(telefono.value);
        const passOK = contrasena.value.length >= 8;
        const matchOK = contrasena.value === confirmarContrasena.value;
        const terminosOK = terminosCheck.checked;

        const todoBien = camposLlenos && emailOK && phoneOK && passOK && matchOK && terminosOK;
        btnRegistro.disabled = !todoBien;
        return todoBien;
    }

    // ===== SUBMIT ===== //
    const registroError = document.getElementById('registroError');

    function mostrarError(msg) {
        if (!registroError) return alert(msg);
        registroError.textContent = msg;
        registroError.classList.remove('hidden');
    }

    function limpiarError() {
        if (!registroError) return;
        registroError.textContent = '';
        registroError.classList.add('hidden');
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        limpiarError();

        if (!validarFormulario()) {
            mostrarError('Por favor completa los datos correctamente.');
            return;
        }

        // Deshabilitar botón durante el envío
        btnRegistro.disabled = true;
        const textoOriginal = btnRegistro.querySelector('.btn-text').textContent;
        btnRegistro.querySelector('.btn-text').textContent = 'Registrando...';

        try {
            // Llamar a la API
            const response = await api.register(
                nombre.value.trim(),
                apellido.value.trim(),
                correo.value.trim().toLowerCase(),
                telefono.value.trim(),
                contrasena.value.trim()
            );

            // Guardar usuario activo y token (api.register ya guarda token en api-client)
            if (response.usuario) {
                localStorage.setItem('currentUser', JSON.stringify(response.usuario));
            }

            // Mostrar éxito inline (breve) y redirigir
            if (registroError) {
                registroError.style.color = '#065f46'; // verde suave
                registroError.textContent = 'Registro exitoso. Redirigiendo...';
                registroError.classList.remove('hidden');
            }

            setTimeout(() => {
                window.location.href = 'creado.html';
            }, 700);

        } catch (error) {
            console.error('Error en registro:', error);
            const msg = (error && error.message) ? error.message : 'Error al registrar. Intenta de nuevo.';
            mostrarError(msg);

            // Restaurar botón
            btnRegistro.disabled = false;
            btnRegistro.querySelector('.btn-text').textContent = textoOriginal;
        }
    });

});
