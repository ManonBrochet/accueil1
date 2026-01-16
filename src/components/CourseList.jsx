import { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import api from '../api/axios';

/**
 * Composant pour afficher la liste des cours
 * Affiche les cours suivis et tous les cours disponibles
 */
function CourseList() {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my'); // 'my' ou 'all'

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      // Charger les cours suivis
      const myCoursesData = await AuthService.getMyCourses();
      setMyCourses(Array.isArray(myCoursesData) ? myCoursesData : []);

      // Charger tous les cours disponibles
      const response = await api.get('/cours');
      setAllCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des cours');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (courseId) => {
    try {
      await api.post(`/cours/${courseId}/suivre`);
      // Recharger les cours
      await loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleUnsubscribe = async (courseId) => {
    try {
      await api.delete(`/cours/${courseId}/suivre`);
      // Recharger les cours
      await loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la désinscription');
    }
  };

  const isSubscribed = (courseId) => {
    return myCourses.some(course => course.id === courseId);
  };

  if (loading) {
    return <div className="loading-text">Chargement des cours...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Erreur : {error}</p>
        <button className="btn-retry" onClick={loadCourses}>Réessayer</button>
      </div>
    );
  }

  const coursesToDisplay = activeTab === 'my' ? myCourses : allCourses;

  return (
    <div className="list-container">
      <table className="list-table">
        <tbody>
          {coursesToDisplay.length === 0 ? (
            <tr>
              <td colSpan="2" className="empty-message">Aucun cours disponible</td>
            </tr>
          ) : (
            coursesToDisplay.map((course, index) => (
              <tr key={course.id}>
                <td className="index-cell">{index + 1}</td>
                <td className="course-name">{course.titre}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CourseList;


