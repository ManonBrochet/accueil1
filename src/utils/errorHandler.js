/**
 * Gestionnaire d'erreurs pour les requêtes API
 */

/**
 * Gère les erreurs HTTP et retourne un message d'erreur approprié
 * @param {Response} response - Objet Response de fetch
 * @returns {Promise<Error>}
 */
export async function handleApiError(response) {
  let errorMessage = 'Une erreur est survenue';
  
  try {
    const error = await response.json();
    errorMessage = error.message || errorMessage;
  } catch (e) {
    // Si la réponse n'est pas du JSON, utiliser le message par défaut
  }

  switch (response.status) {
    case 401:
      return new Error('Session expirée. Veuillez vous reconnecter.');
    case 403:
      return new Error('Accès refusé');
    case 404:
      return new Error('Ressource non trouvée');
    case 400:
      return new Error(errorMessage || 'Requête invalide');
    case 500:
      return new Error('Erreur serveur. Veuillez réessayer plus tard.');
    default:
      return new Error(errorMessage);
  }
}

/**
 * Fait une requête fetch avec gestion d'erreurs
 * @param {string} url - URL de la requête
 * @param {object} options - Options fetch
 * @returns {Promise<object>}
 */
export async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

/**
 * Codes HTTP courants
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};


