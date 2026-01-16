import axios from 'axios';

/**
 * Configuration Axios pour l'API JSP
 * Ajoute automatiquement le token JWT à toutes les requêtes
 * Gère les erreurs 401 (token expiré)
 */

// URL de base : utilise directement l'URL complète pour tester CORS
// Pour revenir au proxy Vite, remplacez par : import.meta.env.DEV ? '/api' : 'https://admin-sdis88.mmi-stdie.fr/api'
const baseURL = 'https://admin-sdis88.mmi-stdie.fr/api';  // Test CORS direct

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajouter le token à toutes les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jsp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gérer les erreurs
api.interceptors.response.use(
  (response) => {
    // Log pour vérifier que CORS fonctionne
    if (import.meta.env.DEV) {
      // Axios normalise les headers en minuscules
      const corsHeaders = {
        'access-control-allow-origin': response.headers['access-control-allow-origin'] || response.headers['Access-Control-Allow-Origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'] || response.headers['Access-Control-Allow-Methods'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials'] || response.headers['Access-Control-Allow-Credentials'],
      };
      
      console.log('✅ CORS OK - Réponse reçue:', {
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        corsHeaders: corsHeaders,
        allHeaders: Object.keys(response.headers),
      });
      
      // Si la requête fonctionne (200), CORS fonctionne !
      if (response.status === 200) {
        console.log('🎉 CORS fonctionne correctement ! La requête a réussi.');
        if (!corsHeaders['access-control-allow-origin']) {
          console.warn('⚠️ Le header Access-Control-Allow-Origin n\'est pas visible dans Axios, mais vérifiez l\'onglet Network pour voir les vrais headers HTTP.');
        }
      }
    }
    return response;
  },
  (error) => {
    // Détecter les erreurs CORS spécifiques
    if (!error.response && error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.error('❌ Erreur CORS détectée:', error);
      const corsError = new Error('Erreur CORS : Le serveur ne permet pas les requêtes depuis cette origine. Vérifiez la configuration CORS du backend.');
      corsError.isCorsError = true;
      return Promise.reject(corsError);
    }
    
    // Gérer les erreurs 401 (token expiré)
    if (error.response?.status === 401) {
      localStorage.removeItem('jsp_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Gérer les erreurs 503 (Service Unavailable)
    if (error.response?.status === 503) {
      const errorMessage = new Error('Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.');
      errorMessage.is503 = true;
      return Promise.reject(errorMessage);
    }
    
    // Gérer les erreurs réseau (pas de réponse)
    if (!error.response) {
      const networkError = new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

export default api;
