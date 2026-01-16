# Guide de dépannage CORS

## ✅ Solution implémentée : Proxy Vite

Le projet utilise un **proxy Vite** pour contourner automatiquement les problèmes CORS en développement.

### Comment ça fonctionne

1. **En développement** (`npm run dev`) :
   - Les requêtes vers `/api/*` sont automatiquement proxifiées
   - Vite fait la requête au serveur backend à votre place
   - Les en-têtes CORS sont gérés automatiquement

2. **En production** :
   - Les requêtes utilisent directement l'URL complète
   - Le serveur backend doit être configuré pour accepter CORS

### Vérification

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez la console du navigateur (F12)

3. Les requêtes devraient maintenant passer par le proxy :
   - ✅ `http://localhost:3000/api/login` (proxifié vers le serveur)
   - ❌ `https://admin-sdis88.mmi-stdie.fr/api/login` (direct, peut causer CORS)

### Si le problème persiste

#### 1. Vérifier que le proxy est actif

Dans la console du navigateur, vérifiez que les requêtes vont vers `http://localhost:3000/api/*` et non vers `https://admin-sdis88.mmi-stdie.fr/api/*`.

#### 2. Redémarrer le serveur Vite

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

#### 3. Vérifier la configuration

Le fichier `vite.config.js` doit contenir :
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

#### 4. Vérifier les services

Les fichiers `src/services/AuthService.js` et `src/api/axios.js` doivent utiliser :
- En développement : `/api` (proxifié)
- En production : `https://admin-sdis88.mmi-stdie.fr/api`

#### 5. Nettoyer le cache

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Redémarrer Vite
npm run dev
```

### Solutions alternatives (si le proxy ne fonctionne pas)

#### Option 1 : Extension navigateur (développement uniquement)

Installer une extension comme "CORS Unblock" ou "CORS Everywhere" pour le développement uniquement.

⚠️ **Ne jamais utiliser en production !**

#### Option 2 : Configuration backend (recommandé pour production)

Le serveur backend doit être configuré pour accepter les requêtes CORS. Contactez l'équipe backend pour ajouter :

```php
// Exemple pour PHP/Laravel
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Erreurs courantes

#### Erreur 405 (Method Not Allowed) sur OPTIONS

Le serveur ne gère pas les requêtes preflight OPTIONS. Le proxy Vite devrait résoudre ce problème automatiquement.

#### Erreur "CORS Missing Allow Origin"

Le serveur ne renvoie pas l'en-tête `Access-Control-Allow-Origin`. Le proxy Vite devrait résoudre ce problème automatiquement.

#### Erreur "Network Error" ou "Failed to fetch"

- Vérifiez votre connexion internet
- Vérifiez que le serveur backend est accessible
- Vérifiez que le proxy est bien configuré dans `vite.config.js`

### Support

Si le problème persiste après avoir essayé toutes ces solutions, contactez l'équipe backend pour vérifier la configuration CORS du serveur.


