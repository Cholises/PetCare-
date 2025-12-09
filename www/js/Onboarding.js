document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Onboarding.js cargado y DOMContentLoaded disparado');
    
    // 🔐 VERIFICAR SESIÓN PERSISTENTE PRIMERO
    const userSession = localStorage.getItem('userSession');
    const currentUser = localStorage.getItem('currentUser');
    
    if (userSession && currentUser) {
        try {
            const session = JSON.parse(userSession);
            const user = JSON.parse(currentUser);
            
            if (session.sessionActive && user.id) {
                console.log('✅ Sesión activa encontrada, redirigiendo a menu.html');
                window.location.href = 'menu.html';
                return;
            }
        } catch (e) {
            console.warn('⚠️ Error al parsear sesión:', e);
        }
    }
    
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    const totalSlides = slides.length;

    console.log('📊 Onboarding info:', { totalSlides, slidesFound: slides.length, dotsFound: dots.length, nextBtnFound: !!nextBtn, skipBtnFound: !!skipBtn });

    // ✅ Solo saltar al login si el usuario ya completó el onboarding
    const onboardingDone = localStorage.getItem('onboardingCompleted') === 'true';

    if (onboardingDone) {
        console.log('✅ Onboarding ya completado, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }

    // Inicializar
    showSlide(currentSlide);

    // Botón "Siguiente" — soportar click, touchend y pointerup (Cordova WebView puede necesitar diferentes eventos)
    function handleNext(e) {
        try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch (er) {}
        console.log('👉 handleNext evento:', e.type, 'currentSlide:', currentSlide, 'totalSlides:', totalSlides);
        
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            console.log('➡️ Avanzando a slide', currentSlide);
            showSlide(currentSlide);
        } else {
            console.log('🎉 Última slide, completando onboarding');
            completeOnboarding();
        }
    }

    if (nextBtn) {
        console.log('✅ Agregando event listeners a nextBtn');
        nextBtn.addEventListener('click', handleNext);
        nextBtn.addEventListener('touchend', handleNext);
        nextBtn.addEventListener('pointerup', handleNext);
    } else {
        console.error('❌ nextBtn no encontrado!');
    }

    // Botón "Saltar"
    function handleSkip(e) {
        try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch (er) {}
        console.log('⏭️ handleSkip evento:', e.type);
        completeOnboarding();
    }

    if (skipBtn) {
        console.log('✅ Agregando event listeners a skipBtn');
        skipBtn.addEventListener('click', handleSkip);
        skipBtn.addEventListener('touchend', handleSkip);
        skipBtn.addEventListener('pointerup', handleSkip);
    } else {
        console.error('❌ skipBtn no encontrado!');
    }

    // FALLBACK: Event listeners de captura global en document (para Cordova)
    document.addEventListener('click', function(e) {
        const target = e.target;
        const isNextBtn = target.id === 'nextBtn' || target.closest('#nextBtn');
        const isSkipBtn = target.id === 'skipBtn' || target.closest('#skipBtn');
        
        if (isNextBtn) {
            console.log('🎯 FALLBACK: click en nextBtn detectado');
            handleNext(e);
        }
        if (isSkipBtn) {
            console.log('🎯 FALLBACK: click en skipBtn detectado');
            handleSkip(e);
        }
    }, true); // useCapture = true para capturar en la fase de captura

    // Puntos de progreso (clic manual)
    if (dots && dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function(e) {
                try { e.preventDefault(); } catch (er) {}
                console.log('🔘 Dot clic:', index);
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
    }

    // Funcionalidad táctil (swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    const slidesWrapper = document.querySelector('.slides-wrapper');

    if (slidesWrapper) {
        slidesWrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            console.log('👆 touchstart:', touchStartX);
        });

        slidesWrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            console.log('🤚 touchend:', touchEndX);
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50 && currentSlide < totalSlides - 1) {
            currentSlide++;
            console.log('👈 Swipe left, nueva slide:', currentSlide);
            showSlide(currentSlide);
        }
        if (touchEndX > touchStartX + 50 && currentSlide > 0) {
            currentSlide--;
            console.log('👉 Swipe right, nueva slide:', currentSlide);
            showSlide(currentSlide);
        }
    }

    function showSlide(index) {
        console.log('🎬 showSlide:', index);
        
        // Actualizar diapositivas
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Actualizar puntos
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Texto del botón
        if (nextBtn) {
            const btnText = nextBtn.querySelector && nextBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = index === totalSlides - 1 ? 'Comenzar' : 'Siguiente';
        }

        // Animación
        const currentSlideElement = slides[index];
        const slideContent = currentSlideElement.querySelector('.slide-content');
        slideContent.style.animation = 'none';
        setTimeout(() => {
            slideContent.style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    }

    function completeOnboarding() {
        console.log('✅ completeOnboarding iniciado');
        // ✅ Marca el onboarding como completado
        localStorage.setItem('onboardingCompleted', 'true');
        console.log('💾 localStorage.onboardingCompleted = true');

        // Animación de salida
        const onboardingContainer = document.querySelector('.onboarding-container');
        if (onboardingContainer) {
            onboardingContainer.style.animation = 'fadeOut 0.5s ease-out';
        }

        console.log('⏱️ Esperando 500ms antes de redirigir a login.html');
        setTimeout(() => {
            console.log('🔗 Redirigiendo a login.html');
            window.location.href = 'login.html';
        }, 500);
        
        // Fallback: redirigir después de 1.5s si no funcionó el primer timeout
        setTimeout(() => {
            console.log('🚨 FALLBACK: Forzando redirección a login.html');
            window.location.replace('login.html');
        }, 1500);
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
