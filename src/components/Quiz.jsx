import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Composant pour passer un quiz
 * @param {number} quizId - ID du quiz à passer
 * @param {function} onComplete - Callback appelé quand le quiz est terminé
 */
function Quiz({ quizId, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [passerId, setPasserId] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    setError('');

    try {
      // Charger le détail du quiz
      const response = await api.get(`/quiz/${quizId}`);
      console.log('Données du quiz reçues:', response.data); // Debug
      setQuiz(response.data);
      
      // Initialiser les réponses vides
      const initialAnswers = {};
      if (response.data.questions && Array.isArray(response.data.questions)) {
        response.data.questions.forEach((q) => {
          initialAnswers[q.id] = null;
        });
      }
      setAnswers(initialAnswers);

      // Démarrer le quiz pour obtenir un passer_id
      try {
        const startResponse = await api.post(`/quiz/${quizId}/start`);
        setPasserId(startResponse.data.passer_id);
      } catch (startErr) {
        console.warn('Impossible de démarrer le quiz (peut-être déjà démarré):', startErr);
        // Continuer même si le start échoue
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du quiz');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Préparer les réponses au format attendu par l'API
      // Format: { "passer_id": 1, "reponses": [{"question_id": 1, "reponse_id": 5}, ...] }
      const reponses = Object.entries(answers)
        .filter(([questionId, answerId]) => answerId !== null)
        .map(([questionId, answerId]) => ({
          question_id: parseInt(questionId),
          reponse_id: parseInt(answerId),
        }));

      // Soumettre les réponses
      const response = await api.post(`/quiz/${quizId}/submit`, {
        passer_id: passerId,
        reponses: reponses,
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la soumission du quiz');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setCurrentQuestionIndex(0);
    const initialAnswers = {};
    const questions = quiz.questions || quiz.question || [];
    questions.forEach((q) => {
      initialAnswers[q.id] = null;
    });
    setAnswers(initialAnswers);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du quiz...</div>;
  }

  if (error && !result) {
    return (
      <div style={{ padding: '1rem', background: '#ffe6e6', color: '#d32f2f', borderRadius: '4px' }}>
        <strong>Erreur :</strong> {error}
        <button
          onClick={loadQuiz}
          style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!quiz) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Quiz non trouvé</div>;
  }

  // Récupérer les questions
  const questions = quiz.questions || [];
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Aucune question disponible dans ce quiz.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(quiz, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Afficher les résultats si le quiz est terminé
  if (result) {
    const score = result.score || result.points || 0;
    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#007bff' }}>Résultats du quiz</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: percentage >= 70 ? '#28a745' : percentage >= 50 ? '#ffc107' : '#dc3545' }}>
            {score}/20
          </div>
          <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '0.5rem' }}>
            {result.correct_answers || 0} / {result.total_questions || total} bonne{result.total_questions > 1 ? 's' : ''} réponse{(result.total_questions || total) > 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: '1rem', color: '#888', marginTop: '0.5rem' }}>
            ({percentage}%)
          </p>
        </div>

        {result.message && (
          <div style={{ padding: '1rem', background: percentage >= 70 ? '#d4edda' : '#fff3cd', borderRadius: '4px', marginBottom: '1rem' }}>
            {result.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            onClick={handleRestart}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Recommencer
          </button>
          {onComplete && (
            <button
              onClick={onComplete}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Retour à la liste
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = Object.values(answers).every((a) => a !== null);

  return (
    <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>
          {quiz.titre || quiz.nom || `Quiz #${quiz.id}`}
        </h2>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          Question {currentQuestionIndex + 1} sur {questions.length}
        </div>
        <div style={{ marginTop: '0.5rem', width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              height: '100%',
              background: '#007bff',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#ffe6e6', color: '#d32f2f', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          {currentQuestion.contenu || currentQuestion.enonce || currentQuestion.question || 'Question sans texte'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(currentQuestion.reponses || []).map((reponse) => (
            <label
              key={reponse.id}
              style={{
                padding: '1rem',
                border: `2px solid ${answers[currentQuestion.id] === reponse.id ? '#007bff' : '#ddd'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: answers[currentQuestion.id] === reponse.id ? '#e7f3ff' : 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (answers[currentQuestion.id] !== reponse.id) {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (answers[currentQuestion.id] !== reponse.id) {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={reponse.id}
                checked={answers[currentQuestion.id] === reponse.id}
                onChange={() => handleAnswerChange(currentQuestion.id, reponse.id)}
                style={{ marginRight: '0.75rem' }}
              />
              {reponse.intitule || reponse.texte || reponse.libelle || 'Réponse sans texte'}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentQuestionIndex === 0 ? '#ccc' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          ← Précédent
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: !allAnswered || submitting ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !allAnswered || submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            {submitting ? 'Envoi...' : 'Terminer le quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            style={{
              padding: '0.75rem 1.5rem',
              background: !answers[currentQuestion.id] ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !answers[currentQuestion.id] ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
