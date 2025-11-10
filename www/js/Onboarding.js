document.addEventListener('DOMContentLoaded', function() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    const totalSlides = slides.length;

    // ✅ Solo saltar al login si el usuario ya completó el onboarding Y tiene sesión (opcional)
    const onboardingDone = localStorage.getItem('onboardingCompleted') === 'true';
    const userLogged = localStorage.getItem('userSession'); // <-- opcional, puedes quitar esta línea

    if (onboardingDone && userLogged) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar
    showSlide(currentSlide);

    // Botón "Siguiente"
    nextBtn.addEventListener('click', function() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
        } else {
            completeOnboarding();
        }
    });

    // Botón "Saltar"
    skipBtn.addEventListener('click', function() {
        completeOnboarding();
    });

    // Puntos de progreso (clic manual)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Funcionalidad táctil (swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    const slidesWrapper = document.querySelector('.slides-wrapper');

    slidesWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    slidesWrapper.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50 && currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
        if (touchEndX > touchStartX + 50 && currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
        }
    }

    function showSlide(index) {
        // Actualizar diapositivas
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Actualizar puntos
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Texto del botón
        nextBtn.querySelector('.btn-text').textContent =
            index === totalSlides - 1 ? 'Comenzar' : 'Siguiente';

        // Animación
        const currentSlideElement = slides[index];
        const slideContent = currentSlideElement.querySelector('.slide-content');
        slideContent.style.animation = 'none';
        setTimeout(() => {
            slideContent.style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    }

    function completeOnboarding() {
        // ✅ Marca el onboarding como completado
        localStorage.setItem('onboardingCompleted', 'true');

        // Animación de salida
        document.querySelector('.onboarding-container').style.animation = 'fadeOut 0.5s ease-out';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
});

// ✅ Animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
