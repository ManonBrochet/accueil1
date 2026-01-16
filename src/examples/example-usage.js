/**
 * Exemples d'utilisation du service d'authentification
 */

import AuthService from '../services/AuthService';
import api from '../api/axios';

// ============================================
// Exemple 1 : Connexion simple
// ============================================
async function exampleLogin() {
  try {
    const { token, user } = await AuthService.login(
      'lucas.durand@gmail.com',
      'password'
    );
    console.log('Connecté:', user);
    console.log('Token:', token);
  } catch (error) {
    console.error('Erreur de connexion:', error.message);
  }
}

// ============================================
// Exemple 2 : Récupérer le profil
// ============================================
async function exampleGetProfile() {
  try {
    const user = await AuthService.getCurrentUser();
    console.log('Profil:', user);
    // {
    //   "id": 1,
    //   "nom": "Durand",
    //   "prenom": "Lucas",
    //   "mail": "lucas.durand@gmail.com",
    //   "grade": { ... },
    //   "is_verified": true,
    //   "stats": { ... }
    // }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ============================================
// Exemple 3 : Récupérer les cours suivis
// ============================================
async function exampleGetCourses() {
  try {
    const courses = await AuthService.getMyCourses();
    console.log('Cours suivis:', courses);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ============================================
// Exemple 4 : Utiliser Axios pour une requête personnalisée
// ============================================
async function exampleAxiosRequest() {
  try {
    // La requête inclut automatiquement le token
    const response = await api.get('/cours');
    console.log('Tous les cours:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Session expirée');
    } else {
      console.error('Erreur:', error.message);
    }
  }
}

// ============================================
// Exemple 5 : S'inscrire à un cours
// ============================================
async function exampleSubscribeToCourse(courseId) {
  try {
    const response = await api.post(`/cours/${courseId}/suivre`);
    console.log('Inscription réussie:', response.data);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ============================================
// Exemple 6 : Déconnexion
// ============================================
function exampleLogout() {
  AuthService.logout();
  // L'utilisateur sera redirigé vers /login
}

// ============================================
// Exemple 7 : Vérifier l'authentification
// ============================================
function exampleCheckAuth() {
  if (AuthService.isAuthenticated()) {
    console.log('Utilisateur connecté');
  } else {
    console.log('Utilisateur non connecté');
  }
}

// ============================================
// Exemple 8 : Requête authentifiée personnalisée
// ============================================
async function exampleCustomRequest() {
  try {
    const response = await AuthService.authenticatedFetch('/jsp/me/quiz', {
      method: 'GET',
    });
    const data = await response.json();
    console.log('Quiz:', data);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ============================================
// Exemple 9 : Télécharger un cours
// Utilise automatiquement jsp-sdis88.mmi-stdie.fr au lieu de admin-sdis88
// ============================================
async function exampleDownloadCourse(courseId) {
  try {
    // Méthode 1 : Téléchargement direct avec blob
    const blob = await AuthService.downloadCourse(courseId);
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cours-${courseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Téléchargement réussi');
  } catch (error) {
    console.error('Erreur de téléchargement:', error.message);
  }
}

// ============================================
// Exemple 10 : Obtenir l'URL de téléchargement
// Retourne une URL avec jsp-sdis88.mmi-stdie.fr
// ============================================
function exampleGetDownloadURL(courseId) {
  const downloadURL = AuthService.getCourseDownloadURL(courseId);
  console.log('URL de téléchargement:', downloadURL);
  // En production : https://jsp-sdis88.mmi-stdie.fr/api/cours/123/download
  // En développement : /api/cours/123/download (proxifié)
  return downloadURL;
}

export {
  exampleLogin,
  exampleGetProfile,
  exampleGetCourses,
  exampleAxiosRequest,
  exampleSubscribeToCourse,
  exampleLogout,
  exampleCheckAuth,
  exampleCustomRequest,
  exampleDownloadCourse,
  exampleGetDownloadURL,
};

