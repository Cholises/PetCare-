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
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Debes iniciar sesión para agregar una mascota.");
      window.location.href = "login.html";
      return;
    }

    const mascota = {
      id: "p_" + Date.now(),
      nombre: document.getElementById("petName").value.trim(),
      tipo: document.getElementById("petType").value,
      raza: document.getElementById("petBreed").value.trim(),
      edad: document.getElementById("petAge").value || "No definida",
      genero: document.getElementById("petGender").value || "No definido",
      notas: document.getElementById("petNotes").value.trim(),
      dueño: currentUser.correo,
      creado: new Date().toISOString(),
    };

    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    mascotas.push(mascota);
    localStorage.setItem("mascotas", JSON.stringify(mascotas));

    alert(`🐶 ${mascota.nombre} fue agregada con éxito`);
    form.reset();
    modal.classList.add("hidden");
  });
});
