import { useState } from 'react';
import AuthService from '../services/AuthService';

/**
 * Composant pour ouvrir/télécharger un cours
 * Ouvre le fichier dans un nouvel onglet (ou télécharge si le popup est bloqué)
 * Utilise automatiquement le domaine public (jsp-sdis88) pour masquer l'URL admin
 * 
 * @param {number} courseId - ID du cours à télécharger
 * @param {string} fileName - Nom du fichier (optionnel)
 * @param {React.ReactNode} children - Contenu du bouton (optionnel)
 */
function CourseDownloadButton({ courseId, fileName, children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      // Télécharger le fichier
      const blob = await AuthService.downloadCourse(courseId);
      
      // Créer une URL blob et ouvrir dans un nouvel onglet
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      // Si le popup est bloqué, proposer le téléchargement
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback : télécharger le fichier
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `cours-${courseId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Nettoyer l'URL blob après un délai (pour permettre l'ouverture)
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement');
      console.error('Erreur de téléchargement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleDownload} 
        disabled={loading}
        className="download-button"
      >
        {loading ? 'Chargement...' : (children || 'Ouvrir')}
      </button>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default CourseDownloadButton;

