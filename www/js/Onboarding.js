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

    // Funcionalidad táctil (swipe) y mouse drag
    let touchStartX = 0;
    let touchEndX = 0;
    let isMouseDown = false;
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const SWIPE_THRESHOLD = 50; // Mínimo de pixels para considerar un swipe

    // Eventos táctiles
    slidesWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, false);

    slidesWrapper.addEventListener('touchmove', function(e) {
        // Evitar que la página se desplace
        if (Math.abs(e.touches[0].clientX - touchStartX) > 10) {
            e.preventDefault();
        }
    }, false);

    slidesWrapper.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, false);

    // Eventos de mouse (para escritorio)
    slidesWrapper.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        touchStartX = e.clientX;
    }, false);

    slidesWrapper.addEventListener('mousemove', function(e) {
        if (!isMouseDown) return;
        touchEndX = e.clientX;
    }, false);

    slidesWrapper.addEventListener('mouseup', function(e) {
        if (!isMouseDown) return;
        isMouseDown = false;
        touchEndX = e.clientX;
        handleSwipe();
    }, false);

    slidesWrapper.addEventListener('mouseleave', function(e) {
        isMouseDown = false;
    }, false);

    function handleSwipe() {
        const difference = touchStartX - touchEndX;
        
        // Swipe hacia la izquierda (siguiente diapositiva)
        if (difference > SWIPE_THRESHOLD && currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
        // Swipe hacia la derecha (diapositiva anterior)
        else if (difference < -SWIPE_THRESHOLD && currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
        }
        
        // Resetear valores
        touchStartX = 0;
        touchEndX = 0;
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
