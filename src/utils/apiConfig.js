/**
 * Configuration des URLs de l'API
 * Gère les différents domaines selon le contexte (API vs téléchargements)
 */

/**
 * URL de base pour les requêtes API
 * En développement : utilise le proxy Vite (/api)
 * En production : utilise l'URL complète avec admin-sdis88
 */
export const getApiBaseURL = () => {
  // En développement, Vite proxy les requêtes /api vers le serveur
  if (import.meta.env.DEV) {
    return '/api';
  }
  // En production, utilise l'URL complète pour l'API
  return 'https://admin-sdis88.mmi-stdie.fr/api';
};

/**
 * URL de base pour les téléchargements (fichiers publics)
 * Utilise toujours le domaine public jsp-sdis88 pour masquer l'URL admin
 * En développement : utilise le proxy Vite (/api)
 * En production : utilise jsp-sdis88.mmi-stdie.fr
 */
export const getDownloadBaseURL = () => {
  // En développement, utilise le proxy Vite
  if (import.meta.env.DEV) {
    return '/api';
  }
  // En production, utilise le domaine public pour les téléchargements
  return 'https://jsp-sdis88.mmi-stdie.fr/api';
};

/**
 * Construit une URL complète pour télécharger un fichier
 * @param {string} relativePath - Chemin relatif (ex: '/cours/123/download' ou '/api/cours/123/download')
 * @returns {string} URL complète pour le téléchargement
 */
export const getDownloadURL = (relativePath) => {
  const baseURL = getDownloadBaseURL();
  
  // Nettoyer le chemin : enlever /api si présent au début
  let cleanPath = relativePath.startsWith('/api') 
    ? relativePath.substring(4) // Enlever '/api'
    : relativePath;
  
  // S'assurer que le chemin commence par /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Si la base URL se termine déjà par /api, on n'ajoute pas /api au chemin
  if (baseURL.endsWith('/api')) {
    return `${baseURL}${cleanPath}`;
  }
  
  // Sinon, ajouter /api au chemin
  return `${baseURL}/api${cleanPath}`;
};

/**
 * Construit une URL complète pour une requête API
 * @param {string} relativePath - Chemin relatif (ex: '/jsp/me' ou '/api/jsp/me')
 * @returns {string} URL complète pour l'API
 */
export const getApiURL = (relativePath) => {
  const baseURL = getApiBaseURL();
  
  // Nettoyer le chemin : enlever /api si présent au début
  let cleanPath = relativePath.startsWith('/api') 
    ? relativePath.substring(4) // Enlever '/api'
    : relativePath;
  
  // S'assurer que le chemin commence par /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Si la base URL se termine déjà par /api, on n'ajoute pas /api au chemin
  if (baseURL.endsWith('/api')) {
    return `${baseURL}${cleanPath}`;
  }
  
  // Sinon, ajouter /api au chemin
  return `${baseURL}/api${cleanPath}`;
};

