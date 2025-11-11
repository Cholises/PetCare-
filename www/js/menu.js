document.addEventListener('DOMContentLoaded', async () => {
  const userNameEl = document.getElementById('userName');
  const totalPetsEl = document.getElementById('totalPets');
  const pendingVaccinesEl = document.getElementById('pendingVaccines');
  const upcomingAppointmentsEl = document.getElementById('upcomingAppointments');
  const petsGrid = document.getElementById('petsGrid');
  const emptyState = document.getElementById('emptyState');

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    // Si no hay usuario, redirigir a login
    // Pero mantener la página visible para demos
    // window.location.href = 'login.html';
  } else {
    userNameEl.textContent = currentUser.nombre || currentUser.nombreCompleto || currentUser.email || 'Usuario';
  }

  async function renderStatsAndPets() {
    // Intentar obtener estadísticas desde API
    try {
      if (typeof api !== 'undefined' && api.getToken()) {
        const stats = await api.getStatistics();
        totalPetsEl.textContent = stats.totalMascotas || 0;
        pendingVaccinesEl.textContent = stats.totalVacunas || 0;
        upcomingAppointmentsEl.textContent = stats.proximasCitas || 0;

        // Render mascotas
        renderPetsList(stats.mascotas || []);
        return;
      }
    } catch (err) {
      console.error('Error obteniendo estadísticas por API:', err);
    }

    // Fallback a localStorage
    const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
    const vacunas = JSON.parse(localStorage.getItem('vacunas') || '[]');
    const citas = JSON.parse(localStorage.getItem('citas') || '[]');

    totalPetsEl.textContent = mascotas.length;
    pendingVaccinesEl.textContent = vacunas.length;
    upcomingAppointmentsEl.textContent = citas.filter(c => new Date(c.fecha) >= new Date()).length;

    renderPetsList(mascotas.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo })));
  }

  function renderPetsList(list) {
    petsGrid.innerHTML = '';
    if (!list || list.length === 0) {
      petsGrid.appendChild(emptyState);
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pet-card';
      card.innerHTML = `
        <div class="pet-avatar">🐾</div>
        <div class="pet-info">
          <h3>${p.nombre}</h3>
          <p>${p.tipo || ''}</p>
        </div>
      `;
      petsGrid.appendChild(card);
    });
  }

  // Re-render cuando se crea una mascota
  window.addEventListener('pet:created', () => {
    renderStatsAndPets();
  });

  // Inicializar
  renderStatsAndPets();
});