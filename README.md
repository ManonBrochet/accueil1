# Frontend JSP

Application frontend pour la plateforme JSP.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

## Build

```bash
npm run build
```

### Endpoint de connexion

**URL :** `POST /api/login`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "email": "lucas.durand@gmail.com",
  "password": "password"
}
```

**Réponse en cas de succès (200) :**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

**Réponse en cas d'erreur (401) :**
```json
{
  "message": "Invalid credentials."
}
```

---

## 📝 Exemple de code JavaScript/TypeScript

### 1. Fonction de connexion

```javascript
/**
 * Connexion d'un JSP
 * @param {string} email - Email du JSP
 * @param {string} password - Mot de passe
 * @returns {Promise<{token: string, user: object}>}
 */
async function loginJSP(email, password) {
  try {
    const response = await fetch('https://admin-sdis88.mmi-stdie.fr/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    const data = await response.json();
    const token = data.token;

    // Stocker le token (localStorage, sessionStorage, ou state management)
    localStorage.setItem('jsp_token', token);

    // Récupérer les infos du JSP connecté
    const user = await getCurrentUser(token);
    
    return { token, user };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}
```

### 2. Récupérer le profil du JSP connecté

```javascript
/**
 * Récupère le profil du JSP connecté
 * @param {string} token - Token JWT
 * @returns {Promise<object>}
 */
async function getCurrentUser(token) {
  const response = await fetch('https://admin-sdis88.mmi-stdie.fr/api/jsp/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  return await response.json();
}

// Exemple de réponse :
// {
//   "id": 1,
//   "nom": "Durand",
//   "prenom": "Lucas",
//   "mail": "lucas.durand@gmail.com",
//   "grade": {
//     "id": 1,
//     "titre": "JSP1",
//     "description": "..."
//   },
//   "is_verified": true,
//   "stats": {
//     "quiz_count": 5,
//     "average_score": 15.2,
//     "participation_count": 3,
//     "courses_count": 8
//   }
// }
```

### 3. Service d'authentification complet (React/Vue/Angular)

Le service `AuthService` est disponible dans `src/services/AuthService.js`. Il fournit toutes les méthodes nécessaires :

- `login(email, password)` - Connexion
- `logout()` - Déconnexion
- `getToken()` - Récupère le token
- `isAuthenticated()` - Vérifie si connecté
- `getCurrentUser()` - Récupère le profil
- `checkTokenValidity()` - Vérifie la validité du token
- `authenticatedFetch(url, options)` - Requête authentifiée
- `getMyCourses()` - Cours suivis
- `getMyQuizzes()` - Historique des quiz
- `getMyEvents()` - Événements inscrits

**Exemple d'utilisation :**

```javascript
import AuthService from './services/AuthService';

// Connexion
const { user } = await AuthService.login('email@example.com', 'password');

// Récupérer le profil
const profile = await AuthService.getCurrentUser();

// Vérifier l'authentification
if (AuthService.isAuthenticated()) {
  // Utilisateur connecté
}
```

**Code complet du service :**

```javascript
class AuthService {
  constructor() {
    this.baseURL = 'https://admin-sdis88.mmi-stdie.fr/api';
    this.tokenKey = 'jsp_token';
  }

  /**
   * Connexion
   */
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Identifiants incorrects');
    }

    const { token } = await response.json();
    this.setToken(token);
    
    // Récupérer le profil
    const user = await this.getCurrentUser();
    return { token, user };
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    // Rediriger vers la page de connexion
  }

  /**
   * Récupère le token stocké
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Stocke le token
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Récupère le profil du JSP connecté
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseURL}/jsp/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        this.logout();
        throw new Error('Session expirée');
      }
      throw new Error('Erreur lors de la récupération du profil');
    }

    return await response.json();
  }

  /**
   * Fait une requête authentifiée
   */
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    if (response.status === 401) {
      // Token expiré
      this.logout();
      throw new Error('Session expirée');
    }

    return response;
  }
}

// Export pour utilisation
export default new AuthService();
```

### 4. Utilisation dans un composant React

Le composant `LoginForm` est disponible dans `src/components/LoginForm.jsx`.

**Exemple d'utilisation :**

```jsx
import LoginForm from './components/LoginForm';

function App() {
  const handleLoginSuccess = (user) => {
    console.log('Utilisateur connecté:', user);
    // Rediriger ou mettre à jour l'état
  };

  return (
    <div>
      <h1>Connexion</h1>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
```

**Code complet du composant :**

```jsx
import { useState, useEffect } from 'react';
import AuthService from './services/AuthService';

function LoginForm() {
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
      // Rediriger vers le dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

### 5. Intercepteur Axios (si vous utilisez Axios)

La configuration Axios est disponible dans `src/api/axios.js`. Elle ajoute automatiquement le token à toutes les requêtes et gère les erreurs 401.

**Exemple d'utilisation :**

```javascript
import api from './api/axios';

// La requête inclut automatiquement le token
const response = await api.get('/cours');
console.log(response.data);

// S'inscrire à un cours
await api.post('/cours/1/suivre');
```

### 6. Téléchargement de cours (masquage de l'URL admin)

Les téléchargements de cours utilisent automatiquement le domaine public `jsp-sdis88.mmi-stdie.fr` au lieu de `admin-sdis88.mmi-stdie.fr` pour masquer l'URL d'administration.

**Avec AuthService :**

```javascript
import AuthService from './services/AuthService';

// Méthode 1 : Téléchargement direct
const blob = await AuthService.downloadCourse(courseId);
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'cours.pdf';
link.click();

// Méthode 2 : Obtenir l'URL de téléchargement
const downloadURL = AuthService.getCourseDownloadURL(courseId);
// En production : https://jsp-sdis88.mmi-stdie.fr/api/cours/123/download
```

**Avec Axios :**

```javascript
import { downloadCourse, getCourseDownloadURL } from './api/axios';

// Téléchargement direct
const blob = await downloadCourse(courseId);

// Obtenir l'URL
const url = getCourseDownloadURL(courseId);
```

**Avec le composant React :**

```jsx
import CourseDownloadButton from './components/CourseDownloadButton';

function CourseList() {
  return (
    <div>
      <h2>Cours disponibles</h2>
      <CourseDownloadButton courseId={123} fileName="cours-secourisme.pdf">
        Télécharger le cours
      </CourseDownloadButton>
    </div>
  );
}
```

**Note :** Les URLs de téléchargement utilisent automatiquement `jsp-sdis88.mmi-stdie.fr` en production, masquant ainsi l'URL d'administration `admin-sdis88.mmi-stdie.fr`.

**Code complet de la configuration :**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin-sdis88.mmi-stdie.fr/api',
});

// Ajouter le token à toutes les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jsp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jsp_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📦 Installation

Pour installer les dépendances du projet, exécutez la commande suivante :

```bash
npm install
```

## 🛠️ Utilisation

Après l'installation, vous pouvez démarrer le serveur de développement avec :

```bash
npm run dev
```

## 📄 Documentation

Pour plus d'informations sur l'utilisation de ce projet, consultez les fichiers suivants :
- [CORS_TROUBLESHOOTING.md](CORS_TROUBLESHOOTING.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [test-cors.md](test-cors.md)

## 🧪 Tests

Pour exécuter les tests, utilisez :

```bash
npm test
```

## 📞 Contact

Pour toute question ou problème, veuillez contacter l'équipe de développement.

---

## 🔒 Sécurité

### Stockage du token

**Options recommandées :**
- **localStorage** : Persiste même après fermeture du navigateur (pratique mais moins sécurisé)
- **sessionStorage** : Supprimé à la fermeture de l'onglet (plus sécurisé)
- **Cookies httpOnly** : Le plus sécurisé mais nécessite une configuration serveur

**⚠️ Important :** Ne jamais stocker le token dans le code source ou le commit dans Git.

### Gestion de l'expiration

Les tokens JWT ont une durée de vie limitée. Il faut :
1. Vérifier la validité du token avant chaque requête
2. Gérer les erreurs 401 (token expiré)
3. Rediriger vers la page de connexion si le token est expiré

```javascript
// Vérifier si le token est valide
async function checkTokenValidity() {
  try {
    await AuthService.getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## 📋 Endpoints disponibles après connexion

Une fois connecté, le JSP peut accéder à :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/jsp/me` | GET | Profil du JSP connecté |
| `/api/jsp/me/cours` | GET | Cours suivis par le JSP |
| `/api/jsp/me/quiz` | GET | Historique des quiz passés |
| `/api/jsp/me/evenements` | GET | Événements auxquels le JSP est inscrit |
| `/api/cours` | GET | Liste de tous les cours |
| `/api/cours/{id}` | GET | Détail d'un cours |
| `/api/cours/{id}/suivre` | POST | S'inscrire à un cours |
| `/api/cours/{id}/download` | GET | Télécharger le fichier d'un cours (utilise jsp-sdis88.mmi-stdie.fr) |
| `/api/quiz` | GET | Liste des quiz disponibles |
| `/api/quiz/{id}` | GET | Détail d'un quiz |
| `/api/evenements` | GET | Liste des événements |

**Tous ces endpoints nécessitent le header :**
```
Authorization: Bearer <token>
```

---

## 🧪 Tests avec cURL

```bash
# 1. Connexion
curl -X POST https://admin-sdis88.mmi-stdie.fr/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "lucas.durand@gmail.com", "password": "password"}'

# Réponse : {"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."}

# 2. Récupérer le profil (remplacer TOKEN par le token reçu)
curl https://admin-sdis88.mmi-stdie.fr/api/jsp/me \
  -H "Authorization: Bearer TOKEN"

# 3. Récupérer les cours suivis
curl https://admin-sdis88.mmi-stdie.fr/api/jsp/me/cours \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚠️ Gestion des erreurs

### Codes HTTP courants

- **200** : Succès
- **401** : Non authentifié ou token invalide/expiré
- **403** : Accès refusé (pas les bonnes permissions)
- **404** : Ressource non trouvée
- **400** : Requête invalide
- **500** : Erreur serveur

### Exemple de gestion d'erreurs

Le gestionnaire d'erreurs est disponible dans `src/utils/errorHandler.js`.

```javascript
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          // Token expiré ou invalide
          AuthService.logout();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        case 403:
          throw new Error('Accès refusé');
        case 404:
          throw new Error('Ressource non trouvée');
        default:
          throw new Error(error.message || 'Une erreur est survenue');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}
```

---

## 📁 Structure du projet

```
frontendJSP/
├── src/
│   ├── services/
│   │   └── AuthService.js          # Service d'authentification
│   ├── api/
│   │   └── axios.js                # Configuration Axios
│   ├── components/
│   │   ├── LoginForm.jsx           # Composant de connexion
│   │   ├── ProtectedRoute.jsx     # Route protégée
│   │   ├── CourseDownloadButton.jsx # Bouton de téléchargement
│   │   └── CourseDownloadLink.jsx  # Lien de téléchargement
│   ├── utils/
│   │   ├── errorHandler.js        # Gestionnaire d'erreurs
│   │   └── apiConfig.js            # Configuration des URLs (API vs téléchargements)
│   └── examples/
│       └── example-usage.js       # Exemples d'utilisation
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔧 Résolution des problèmes

### ⚠️ Problème : VPN et WAF Tiger Protect

**Symptôme :**
- Erreur 503 (Service Temporarily Unavailable)
- "Request failed with status code 503"
- Page HTML "Security check" au lieu de JSON

**Cause :**
Le WAF Tiger Protect bloque les requêtes provenant de VPNs.

**Solution :**
**Désactiver le VPN** lors de l'utilisation de l'application. Le WAF détecte les VPNs comme des sources suspectes.

> 💡 **Note :** Si vous devez absolument utiliser un VPN, contactez l'équipe backend pour ajouter votre IP à la whitelist du WAF.

### Configuration CORS

✅ **Le backend gère maintenant CORS automatiquement !**

Le backend Symfony a un `CorsListener` qui autorise les requêtes depuis :
- `https://jsp-sdis88.mmi-stdie.fr` (production)
- `http://localhost:3000` (développement Vite)
- `http://localhost:5173` (développement Vite alternatif)
- `http://localhost:8080` (développement alternatif)
- `http://localhost:4200` (développement Angular)
- Et d'autres ports locaux

**Deux modes de fonctionnement disponibles :**

#### Mode 1 : Proxy Vite (recommandé pour le développement)

Le projet est configuré avec un **proxy Vite** qui fonctionne automatiquement :

**Configuration dans `vite.config.js` :**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://admin-sdis88.mmi-stdie.fr',
      changeOrigin: true,
      secure: true,
    },
  },
}
```

**Avantages :**
- Pas de problème CORS (les requêtes passent par le serveur Vite)
- Fonctionne même si le backend n'a pas CORS configuré
- Plus simple pour le développement

#### Mode 2 : Requêtes directes (si vous préférez)

Vous pouvez aussi utiliser directement l'URL complète en développement. Le backend gère CORS automatiquement.

**Pour activer ce mode**, modifiez `src/api/axios.js` :
```javascript
const baseURL = 'https://admin-sdis88.mmi-stdie.fr/api'; // Toujours l'URL complète
```

**Par défaut**, le code utilise le proxy Vite en développement (`/api`) et l'URL complète en production. **Aucune modification nécessaire !**

---

## 🚀 Déploiement en production

Pour déployer l'application en production, consultez le guide complet : **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Résumé rapide

1. **Build de production :**
   ```bash
   npm run build
   ```

2. **Prérequis infrastructure :**
   - Le domaine `jsp-sdis88.mmi-stdie.fr` doit pointer vers le même backend que `admin-sdis88.mmi-stdie.fr`
   - ✅ Configuration CORS du backend : Le `CorsListener` Symfony autorise déjà `jsp-sdis88.mmi-stdie.fr`

3. **Déploiement :**
   - Copier le contenu de `dist/` sur votre serveur web
   - Configurer le serveur pour les routes SPA (voir `DEPLOYMENT.md`)

### URLs en production

- **API** : `https://admin-sdis88.mmi-stdie.fr/api`
- **Téléchargements** : `https://jsp-sdis88.mmi-stdie.fr/api/cours/.../download`
- **Frontend** : `https://jsp-sdis88.mmi-stdie.fr`

---

## 📞 Support

Pour toute question sur l'API, contactez l'équipe backend.

**Base URL de production :** `https://admin-sdis88.mmi-stdie.fr/api`
**Base URL de développement :** Utilise automatiquement le proxy Vite (`/api`)
