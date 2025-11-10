// js/account-created.js

document.addEventListener("DOMContentLoaded", () => {

    const welcomeUserText = document.getElementById("welcomeUserText");
    const goToMenuBtn = document.getElementById("goToMenuBtn");

    // Mostrar el nombre del usuario si existe en localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser) {
        welcomeUserText.textContent = `¡Bienvenido, ${currentUser.nombre}! 🎉`;
    }

    // Botón para ir al menú
    goToMenuBtn.addEventListener("click", () => {
        window.location.href = "menu.html";
    });

    // ===== CONFETTI =====
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const confetti = [];
    const colors = ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"];

    for (let i = 0; i < 70; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            tilt: Math.random() * 10 - 10,
            tiltAngle: Math.random() * 0.1 - 0.05
        });
    }

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach((p) => {
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.tilt, 0, 2 * Math.PI);
            ctx.fill();
        });
        updateConfetti();
        requestAnimationFrame(drawConfetti);
    }

    function updateConfetti() {
        confetti.forEach((p) => {
            p.y += p.speed;
            p.x += Math.sin(p.tilt);
            p.tilt += p.tiltAngle;

            if (p.y > canvas.height + 10) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
    }

    // Iniciar animación
    drawConfetti();

    // Auto redirigir tras 2.5 segundos
    setTimeout(() => {
        window.location.href = "menu.html";
    }, 5500);

});
