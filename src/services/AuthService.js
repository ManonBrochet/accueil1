/**
 * Service d'authentification JSP
 * Gère la connexion, déconnexion et les requêtes authentifiées
 */

import api from '../api/axios';

class AuthService {
  constructor() {
    this.tokenKey = 'jsp_token';
  }

  /**
   * Connexion d'un JSP
   * @param {string} email - Email du JSP
   * @param {string} password - Mot de passe
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      const { token } = response.data;
      
      this.setToken(token);
      
      // Récupérer le profil
      const user = await this.getCurrentUser();
      return { token, user };
    } catch (error) {
      // Gérer les erreurs spécifiques
      if (error.is503) {
        throw new Error('Le serveur est temporairement indisponible. Le WAF peut bloquer les requêtes. Contactez l\'équipe backend.');
      }
      if (error.isNetworkError) {
        throw error;
      }
      // Erreur HTTP standard
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      throw new Error(message);
    }
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Récupère le token stocké
   * @returns {string|null}
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Stocke le token
   * @param {string} token - Token JWT
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Récupère le profil du JSP connecté
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
    const response = await api.get('/jsp/me');
    return response.data;
  }

  /**
   * Vérifie si le token est valide
   * @returns {Promise<boolean>}
   */
  async checkTokenValidity() {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère les cours suivis par le JSP
   * @returns {Promise<object>}
   */
  async getMyCourses() {
    const response = await api.get('/jsp/me/cours');
    return response.data;
  }

  /**
   * Récupère l'historique des quiz
   * @returns {Promise<object>}
   */
  async getMyQuizzes() {
    const response = await api.get('/jsp/me/quiz');
    return response.data;
  }

  /**
   * Récupère les événements auxquels le JSP est inscrit
   * @returns {Promise<object>}
   */
  async getMyEvents() {
    const response = await api.get('/jsp/me/evenements');
    return response.data;
  }

  /**
   * Télécharge un fichier de cours
   * @param {number} courseId - ID du cours
   * @returns {Promise<Blob>} Fichier à télécharger
   */
  async downloadCourse(courseId) {
    const response = await api.get(`/cours/${courseId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Obtient l'URL de téléchargement d'un cours
   * @param {number} courseId - ID du cours
   * @returns {string} URL complète de téléchargement
   */
  getCourseDownloadURL(courseId) {
    const baseURL = import.meta.env.DEV 
      ? '/api'
      : 'https://jsp-sdis88.mmi-stdie.fr/api';
    return `${baseURL}/cours/${courseId}/download`;
  }
}

// Export singleton
export default new AuthService();
