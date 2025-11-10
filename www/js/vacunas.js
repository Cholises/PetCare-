document.addEventListener('DOMContentLoaded', () => {
  const formSection = document.getElementById('vaccineFormSection');
  const openFormBtn = document.getElementById('openFormBtn');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const form = document.getElementById('vaccineForm');
  const list = document.getElementById('vaccineList');

  loadPets();
  renderVaccines();

  openFormBtn.addEventListener('click', () => formSection.classList.remove('hidden'));
  cancelFormBtn.addEventListener('click', () => formSection.classList.add('hidden'));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = getFormData();
    if (!validateData(data)) return;

    saveVaccine(data);
    form.reset();
    formSection.classList.add('hidden');
    renderVaccines();
    alert('Vacuna agregada con éxito 💉');
  });
});

function getFormData() {
  return {
    id: Date.now(),
    pet: document.getElementById('petSelect').value,
    name: document.getElementById('vaccineName').value.trim(),
    date: document.getElementById('vaccineDate').value,
    nextDose: document.getElementById('nextDose').value,
    notes: document.getElementById('vaccineNotes').value.trim()
  };
}

function validateData(data) {
  if (!data.pet || !data.name || !data.date) {
    alert('Por favor completa todos los campos obligatorios');
    return false;
  }
  return true;
}

function saveVaccine(data) {
  const vaccines = JSON.parse(localStorage.getItem('vaccines') || '[]');
  vaccines.push(data);
  localStorage.setItem('vaccines', JSON.stringify(vaccines));
}

function renderVaccines() {
  const vaccines = JSON.parse(localStorage.getItem('vaccines') || '[]');
  const list = document.getElementById('vaccineList');

  if (vaccines.length === 0) {
    list.innerHTML = `<p class="empty-text">Aún no has registrado ninguna vacuna 🐾</p>`;
    return;
  }

  list.innerHTML = vaccines.map(vac => `
    <div class="vaccine-card">
      <h3>${vac.name}</h3>
      <p><strong>Mascota:</strong> ${vac.pet}</p>
      <p><strong>Fecha aplicada:</strong> ${vac.date}</p>
      <p><strong>Próxima dosis:</strong> ${vac.nextDose || 'N/A'}</p>
      ${vac.notes ? `<p><em>${vac.notes}</em></p>` : ''}
    </div>
  `).join('');
}

function loadPets() {
  const pets = JSON.parse(localStorage.getItem('pets') || '[]');
  const select = document.getElementById('petSelect');
  if (pets.length === 0) {
    select.innerHTML = `<option value="">No tienes mascotas registradas</option>`;
    return;
  }
  select.innerHTML = pets.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}
