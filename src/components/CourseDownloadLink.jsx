import AuthService from '../services/AuthService';

/**
 * Composant pour créer un lien de téléchargement de cours
 * Utilise automatiquement le domaine public (jsp-sdis88) pour masquer l'URL admin
 * 
 * @param {number} courseId - ID du cours à télécharger
 * @param {string} className - Classes CSS (optionnel)
 * @param {React.ReactNode} children - Contenu du lien (optionnel)
 */
function CourseDownloadLink({ courseId, className, children }) {
  const token = AuthService.getToken();
  
  if (!token) {
    return null;
  }

  // Obtenir l'URL de téléchargement avec le domaine public
  const downloadURL = AuthService.getCourseDownloadURL(courseId);

  const handleClick = (e) => {
    // Le navigateur gérera automatiquement le téléchargement avec le token dans le header
    // Pour que ça fonctionne, il faudra peut-être utiliser un iframe ou fetch
    // Sinon, utilisez CourseDownloadButton à la place
    e.preventDefault();
    window.open(downloadURL, '_blank');
  };

  return (
    <a 
      href={downloadURL}
      onClick={handleClick}
      className={className}
      download
    >
      {children || 'Télécharger'}
    </a>
  );
}

export default CourseDownloadLink;


