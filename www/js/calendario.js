// js/calendario.js

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Debes iniciar sesión para ver el calendario');
    window.location.href = 'login.html';
    return;
  }

  const correoUsuario = currentUser.correo || currentUser.email || null;

  const calendarGrid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('monthLabel');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const dayEvents = document.getElementById('dayEvents');

  let viewDate = new Date(); // mes mostrado

  // Cargar eventos del usuario (citas, vacunas, recordatorios)
  function loadUserEvents() {
    const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
    const userPets = todasMascotas.filter(p =>
      (p['dueño'] === correoUsuario) || (p.owner === correoUsuario) || (p.userId === currentUser.id)
    );
    const userPetIds = userPets.map(p => p.id);

    // Citas
    const todasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
    const citas = todasCitas
      .filter(c => userPetIds.includes(c.mascotaId))
      .map(c => ({
        type: 'cita',
        id: c.id,
        title: c.nombreMascota || 'Cita',
        date: c.fecha,
        time: c.hora || '00:00',
        raw: c
      }));

    // Vacunas (tomamos nextDoseDate si existe, sino applicationDate)
    const todasVacunas = JSON.parse(localStorage.getItem('vacunas') || '[]');
    const vacunas = todasVacunas
      .filter(v => (v.userId === correoUsuario) || userPetIds.includes(v.petId))
      .map(v => ({
        type: 'vacuna',
        id: v.id,
        title: v.vaccineName || 'Vacuna',
        date: v.nextDoseDate || v.applicationDate,
        time: '00:00',
        raw: v
      }));

    // Recordatorios
    const todosRecordatorios = JSON.parse(localStorage.getItem('recordatorios') || '[]');
    const recordatorios = todosRecordatorios
      .filter(r => userPetIds.includes(r.mascotaId))
      .map(r => ({
        type: 'recordatorio',
        id: r.id,
        title: r.titulo || r.motivo || 'Recordatorio',
        date: r.fecha,
        time: r.hora || '00:00',
        raw: r
      }));

    // Normalizar fechas y filtrar inválidas
    const all = [...citas, ...vacunas, ...recordatorios]
      .map(e => ({ ...e, datetime: parseDateTime(e.date, e.time) }))
      .filter(e => e.datetime && !isNaN(e.datetime.getTime()));

    return { events: all, userPets };
  }

  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return null;
    try {
      // Si dateStr incluye time, Date constructor lo manejará
      if (timeStr) {
        return new Date(`${dateStr}T${timeStr}`);
      }
      return new Date(dateStr);
    } catch (e) {
      return null;
    }
  }

  function start() {
    renderCalendar();
    prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });
  }

  function renderCalendar() {
    const { events, userPets } = loadUserEvents();

    // encabezado
    const monthName = viewDate.toLocaleString('es-ES', { month: 'long' });
    monthLabel.textContent = `${capitalize(monthName)} ${viewDate.getFullYear()}`;

    // primeras cosas
    calendarGrid.innerHTML = '';

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    // días de la semana encabezado
    const weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    weekDays.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell header-cell';
      cell.textContent = d;
      calendarGrid.appendChild(cell);
    });

    // offset (primero poner días vacíos hasta el primer día)
    // JavaScript: getDay() domingo=0, lunes=1... queremos lunes=0 index
    const jsFirst = firstDay.getDay();
    // Convertir a índice donde lunes=0
    const offset = (jsFirst + 6) % 7;

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-cell empty';
      calendarGrid.appendChild(empty);
    }

    // Crear celdas de días
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const cell = document.createElement('div');
      cell.className = 'calendar-cell day-cell';
      const dayNum = document.createElement('div');
      dayNum.className = 'day-number';
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      // buscar eventos para este día
      const eventsForDay = events.filter(e => isSameDay(e.datetime, dateObj));
      if (eventsForDay.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'events-badge';
        badge.textContent = eventsForDay.length;
        cell.appendChild(badge);
      }

      cell.addEventListener('click', () => showEventsForDate(dateObj, eventsForDay, userPets));

      calendarGrid.appendChild(cell);
    }

    // rellenar finales para mantener cuadrícula
    const totalCells = calendarGrid.children.length;
    const rem = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < rem; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-cell empty';
      calendarGrid.appendChild(empty);
    }

    // limpiar lista de eventos
    dayEvents.innerHTML = '<div class="no-events">Selecciona un día para ver eventos</div>';
  }

  function showEventsForDate(dateObj, eventsForDay, userPets) {
    dayEvents.innerHTML = '';

    const header = document.createElement('h4');
    header.textContent = `Eventos para ${dateObj.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric'})}`;
    dayEvents.appendChild(header);

    if (!eventsForDay || eventsForDay.length === 0) {
      const p = document.createElement('div');
      p.className = 'no-events';
      p.textContent = 'No hay eventos para este día';
      dayEvents.appendChild(p);
      return;
    }

    const list = document.createElement('div');
    list.className = 'events-list';

    eventsForDay.sort((a,b) => a.datetime - b.datetime).forEach(ev => {
      const item = document.createElement('div');
      item.className = 'event-item ' + ev.type;
      const timeSpan = document.createElement('div');
      timeSpan.className = 'event-time';
      timeSpan.textContent = ev.time || formatTime(ev.datetime);
      const info = document.createElement('div');
      info.className = 'event-info';
      const title = document.createElement('div');
      title.className = 'event-title';
      title.textContent = ev.title;
      const sub = document.createElement('div');
      sub.className = 'event-sub';
      // Añadir nombre de mascota si aplica
      let petName = '';
      if (ev.raw && (ev.raw.mascotaId || ev.raw.petId)) {
        const pid = ev.raw.mascotaId || ev.raw.petId;
        const pet = userPets.find(p => p.id === pid);
        petName = pet ? ` • ${pet.nombre}` : '';
      }
      sub.textContent = (ev.raw && ev.raw.veterinaria) ? ev.raw.veterinaria + petName : (ev.raw && ev.raw.motivo ? ev.raw.motivo + petName : petName);

      info.appendChild(title);
      info.appendChild(sub);
      item.appendChild(timeSpan);
      item.appendChild(info);

      // Hacer el elemento clicable y navegar a la página de citas (con parámetros)
      const link = document.createElement('a');
      const href = `citas.html?date=${encodeURIComponent(ev.date)}&type=${encodeURIComponent(ev.type)}${ev.id ? `&id=${encodeURIComponent(ev.id)}` : ''}`;
      link.href = href;
      link.className = 'event-link';
      link.appendChild(item);
      list.appendChild(link);
    });

    dayEvents.appendChild(list);
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatTime(d) {
    try {
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Estilos rápidos (si no hay CSS específico)
  const style = document.createElement('style');
  style.textContent = `
    #calendarApp { display:flex; flex-direction:column; gap:12px; }
    .calendar-header { display:flex; align-items:center; justify-content:space-between; }
    .calendar-grid { display:grid; grid-template-columns: repeat(7,1fr); gap:6px; }
    .calendar-cell { background:#fff; border:1px solid #eee; padding:8px; min-height:70px; position:relative; border-radius:6px; }
    .calendar-cell.header-cell { background:transparent; border:none; font-weight:700; text-align:center; }
    .calendar-cell.empty { background:transparent; border:none; }
    .day-number { position:absolute; top:6px; right:8px; font-size:0.9rem; color:#666; }
    .events-badge { position:absolute; bottom:6px; left:6px; background:var(--primary,#3b82f6); color:#fff; padding:4px 8px; border-radius:12px; font-size:0.8rem; }
    .day-events { margin-top:12px; }
    .no-events { color:#666; padding:12px; }
    .event-item { display:flex; gap:12px; padding:8px; border-bottom:1px solid #f0f0f0; }
    .event-time { width:64px; font-weight:700; color:#222; }
    .event-title { font-weight:600; }
    .event-sub { color:#666; font-size:0.9rem; }
    .event-item.cita .event-time { color:#ef4444; }
    .event-item.vacuna .event-time { color:#0ea5a4; }
    .event-item.recordatorio .event-time { color:#f59e0b; }
    .event-link { text-decoration: none; color: inherit; display: block; }
  `;
  document.head.appendChild(style);

  start();
});
