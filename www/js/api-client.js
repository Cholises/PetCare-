// =====================================================
// API Service - Cliente para consumir la API
// =====================================================

const API_URL = 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.token = this.getToken();
  }

  // Almacenar y recuperar token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken') || null;
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Headers por defecto
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers?.['Content-Type'] || 'application/json')
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  async register(nombre, apellido, email, telefono, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, apellido, email, telefono, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.removeToken();
    localStorage.removeItem('currentUser');
  }

  // =====================================================
  // USUARIO
  // =====================================================

  async getProfile() {
    return this.request('/usuario/perfil', {
      method: 'GET'
    });
  }

  async updateProfile(nombre, apellido, telefono) {
    return this.request('/usuario/perfil', {
      method: 'PUT',
      body: JSON.stringify({ nombre, apellido, telefono })
    });
  }

  // =====================================================
  // MASCOTAS
  // =====================================================

  async getPets() {
    return this.request('/mascotas', {
      method: 'GET'
    });
  }

  async createPet(nombre, tipo, raza, edad, genero, notas) {
    return this.request('/mascotas', {
      method: 'POST',
      body: JSON.stringify({ nombre, tipo, raza, edad, genero, notas })
    });
  }

  async updatePet(id, nombre, tipo, raza, edad, genero, notas) {
    return this.request(`/mascotas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre, tipo, raza, edad, genero, notas })
    });
  }

  async deletePet(id) {
    return this.request(`/mascotas/${id}`, {
      method: 'DELETE'
    });
  }

  // =====================================================
  // CITAS
  // =====================================================

  async getAppointments() {
    return this.request('/citas', {
      method: 'GET'
    });
  }

  async createAppointment(mascotaId, fecha, hora, veterinario, motivo, notas) {
    return this.request('/citas', {
      method: 'POST',
      body: JSON.stringify({ mascotaId, fecha, hora, veterinario, motivo, notas })
    });
  }

  async updateAppointment(id, fecha, hora, veterinario, motivo, notas, estado) {
    return this.request(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ fecha, hora, veterinario, motivo, notas, estado })
    });
  }

  async deleteAppointment(id) {
    return this.request(`/citas/${id}`, {
      method: 'DELETE'
    });
  }

  // =====================================================
  // VACUNAS
  // =====================================================

  async getVaccines() {
    return this.request('/vacunas', {
      method: 'GET'
    });
  }

  async createVaccine(mascotaId, nombreVacuna, fecha, proximaDosis, veterinario, notas) {
    return this.request('/vacunas', {
      method: 'POST',
      body: JSON.stringify({ mascotaId, nombreVacuna, fecha, proximaDosis, veterinario, notas })
    });
  }

  async deleteVaccine(id) {
    return this.request(`/vacunas/${id}`, {
      method: 'DELETE'
    });
  }

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  async getStatistics() {
    return this.request('/estadisticas', {
      method: 'GET'
    });
  }
}

// Instancia global
const api = new APIClient();
