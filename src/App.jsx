import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import CourseList from './components/CourseList';
import EventCalendar from './components/EventCalendar';
import QuizList from './components/QuizList';
import AuthService from './services/AuthService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="login-container">
        <h1 className="login-title">Connexion JSP</h1>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="page">
        {/* Bandeau haut */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="logo">
              <img src="/logo_jsp.png" alt="JSP 88" className="logo-img" />
              <span className="logo-text">JSP 88</span>
            </div>
          </div>
          <div className="topbar-center"></div>
          <div className="topbar-right">
            <button className="btn-gabs">{user.prenom}</button>
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        <main className="dashboard">
          {/* Tuiles Cours / Quiz / Planning */}
          <section className="tiles">
            <div className="tile tile-cours">COURS</div>
            <div className="tile tile-quiz">QUIZ</div>
            <div className="tile tile-planning">PLANNING</div>
          </section>

          {/* Récents */}
          <section className="recents">
            <h2 className="section-title">Récents</h2>
            <div className="recents-grid">
              <article className="card card-lorem">
                <h3>Lorem Ipsum :</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea
                  commodo consequat.
                </p>
              </article>
              <article className="card card-calendar">
                <EventCalendar />
              </article>
            </div>
          </section>

          {/* Cours + Quiz */}
          <section className="lists">
            <div className="list-column">
              <h3>Cours</h3>
              <div className="card card-cours-list">
                <CourseList />
              </div>
            </div>
            <div className="list-column">
              <h3>Quiz</h3>
              <div className="card card-quiz-list">
                <QuizList />
              </div>
            </div>
          </section>

          {/* Texte bas */}
          <section className="bottom-text card card-bottom">
            <h3>Lorem Ipsum :</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat.
            </p>
          </section>
        </main>

        {/* Footer violet */}
        <footer className="footer">
          <div className="footer-facebook">f</div>
          <div className="footer-links">
            <span>Lien</span>
            <span>Lien</span>
            <span>Lien</span>
            <span>Lien</span>
            <span>Lien</span>
          </div>
          <div className="footer-bottom">
            <span>Mentions légales</span>
            <span>Copyright © IUT SAINT DIE DES VOSGES</span>
          </div>
        </footer>


      </div>
    </ProtectedRoute>
  );
}

export default App;
