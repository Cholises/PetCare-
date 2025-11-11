document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("quickAddBtn");
  const emptyStateBtn = document.getElementById("emptyStateBtn");
  const modal = document.getElementById("addPetModal");
  const closeModal = document.getElementById("closeModal");
  const form = document.getElementById("petForm");

  // Abrir modal desde el botón "+"
  addBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("hidden");
  });

  // Abrir modal desde el botón de estado vacío
  emptyStateBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Cerrar modal
  closeModal?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Guardar mascota
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Debes iniciar sesión para agregar una mascota.");
      window.location.href = "login.html";
      return;
    }

    const nombre = document.getElementById("petName").value.trim();
    const tipo = document.getElementById("petType").value;
    const raza = document.getElementById("petBreed").value.trim();
    const edad = document.getElementById("petAge").value || "No definida";
    const genero = document.getElementById("petGender").value || "No definido";
    const notas = document.getElementById("petNotes").value.trim();

    // Si hay cliente API disponible y token, usar API
    try {
      if (typeof api !== 'undefined' && api.getToken()) {
        const res = await api.createPet(nombre, tipo, raza, edad, genero, notas);
        alert(`🐶 ${res.mascota.nombre} fue agregada con éxito`);
        form.reset();
        modal.classList.add("hidden");
        // Notificar al resto de la app que se agregó una mascota
        window.dispatchEvent(new CustomEvent('pet:created', { detail: res.mascota }));
        return;
      }
    } catch (err) {
      console.error('Error creando mascota por API:', err);
      // fallback a localStorage
    }

    // Fallback: localStorage
    const mascota = {
      id: "p_" + Date.now(),
      nombre,
      tipo,
      raza,
      edad,
      genero,
      notas,
      dueño: currentUser.email || currentUser.correo || currentUser.nombreCompleto,
      creado: new Date().toISOString(),
    };

    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    mascotas.push(mascota);
    localStorage.setItem("mascotas", JSON.stringify(mascotas));

    alert(`🐶 ${mascota.nombre} fue agregada con éxito`);
    form.reset();
    modal.classList.add("hidden");
    window.dispatchEvent(new CustomEvent('pet:created', { detail: mascota }));
  });
});
