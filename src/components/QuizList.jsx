import { useState, useEffect } from 'react';
import api from '../api/axios';
import Quiz from './Quiz';

/**
 * Composant pour afficher la liste des quiz disponibles
 */
function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/quiz');
      setQuizzes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des quiz');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleQuizComplete = () => {
    setSelectedQuiz(null);
    loadQuizzes(); // Recharger la liste après avoir terminé un quiz
  };

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  // Si un quiz est sélectionné, afficher le composant Quiz
  if (selectedQuiz) {
    return (
      <div>
        <button
          onClick={handleBack}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Retour à la liste
        </button>
        <Quiz quizId={selectedQuiz.id} onComplete={handleQuizComplete} />
      </div>
    );
  }

  if (loading) {
    return <div className="loading-text">Chargement des quiz...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <strong>Erreur :</strong> {error}
        <button className="btn-retry" onClick={loadQuizzes}>Réessayer</button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="empty-message">
        Aucun quiz disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="list-container">
      <table className="list-table">
        <tbody>
          {quizzes.map((quiz, index) => (
            <tr key={quiz.id} onClick={() => handleQuizSelect(quiz)} style={{ cursor: 'pointer' }}>
              <td className="index-cell">{index + 1}</td>
              <td className="quiz-name">{quiz.titre || quiz.nom || `Quiz #${quiz.id}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuizList;
