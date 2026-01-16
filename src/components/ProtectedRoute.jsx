import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

/**
 * Composant de route protégée
 * Vérifie l'authentification avant d'afficher le contenu
 * @param {React.ReactNode} children - Contenu à afficher si authentifié
 * @param {React.ReactNode} fallback - Contenu à afficher pendant la vérification
 */
function ProtectedRoute({ children, fallback = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await AuthService.checkTokenValidity();
        setIsAuthenticated(isValid);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return fallback || <div>Vérification de l'authentification...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return children;
}

export default ProtectedRoute;


