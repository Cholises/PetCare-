// menu.js — Modo Híbrido: Swipe = paginado, Wheel = scroll libre
(function(){
  const main = document.querySelector('.main-content');
  if (!main) return;

  const sections = Array.from(main.querySelectorAll(':scope > section'));
  if (!sections.length) return;

  let current = 0;
  let isSwiping = false;

  function goToSection(index){
    index = Math.max(0, Math.min(sections.length - 1, index));
    current = index;
    const target = sections[current];
    if (!target) return;
    main.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }

  // Detectar sección actual
  function detectCurrent(){
    const scrollTop = main.scrollTop;
    let best = 0;
    let bestDiff = Infinity;
    sections.forEach((sec, i) => {
      const diff = Math.abs(sec.offsetTop - scrollTop);
      if (diff < bestDiff){ bestDiff = diff; best = i; }
    });
    current = best;
  }

  // ===== SWIPE: Paginado por secciones =====
  let touchStartY = 0;
  let touchStartTime = 0;

  main.addEventListener('touchstart', function(e){
    if (e.touches && e.touches.length){
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isSwiping = true;
    }
  }, { passive: true });

  main.addEventListener('touchmove', function(e){
    // Permitir scroll libre con dos dedos (pinch), solo detectar swipe vertical con un dedo
    if (e.touches && e.touches.length > 1) isSwiping = false;
  }, { passive: true });

  main.addEventListener('touchend', function(e){
    if (!isSwiping || !e.changedTouches || !e.changedTouches.length) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    const timeDiff = Date.now() - touchStartTime;
    const velocity = Math.abs(diff) / timeDiff; // pixels per ms
    
    // Detectar swipe: mínimo 40px Y mínimo velocidad de 0.1 px/ms (rápido)
    if (Math.abs(diff) > 40 && velocity > 0.1){
      if (diff > 0) goToSection(current + 1);  // swipe up → siguiente
      else goToSection(current - 1);            // swipe down → anterior
    }
    
    isSwiping = false;
  }, { passive: true });

  // ===== WHEEL: Scroll libre (sin paginado) =====
  // El wheel event no interfiere; el navegador hace scroll normal
  main.addEventListener('wheel', function(e){
    // Permitir scroll normal; NO se hace paginado
    // Este handler es solo para futuro (ej: analytics)
  }, { passive: true });

  // ===== KEYBOARD: Flecha arriba/abajo = paginado, PageUp/PageDown = scroll libre =====
  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown'){ e.preventDefault(); goToSection(current + 1); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); goToSection(current - 1); }
    // PageUp / PageDown permiten scroll libre (no prevenimos)
    else if (e.key === 'Home'){ e.preventDefault(); goToSection(0); }
    else if (e.key === 'End'){ e.preventDefault(); goToSection(sections.length - 1); }
  });

  // Actualizar sección visible cuando el usuario hace scroll manual
  let scrollTimeout = null;
  main.addEventListener('scroll', function(){
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(detectCurrent, 150);
  });

  // Inicialización
  detectCurrent();
})();
