import { useState } from 'react';
import AuthService from '../services/AuthService';

/**
 * Composant de formulaire de connexion
 */
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await AuthService.login(email, password);
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="lucas.durand@gmail.com"
          required
          disabled={loading}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          className="form-input"
        />
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="btn-submit"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}

export default LoginForm;
