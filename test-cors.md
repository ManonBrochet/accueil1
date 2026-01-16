# Test CORS

## 🔍 Comment tester CORS

Le fichier `src/api/axios.js` a été modifié pour utiliser directement l'URL complète (`https://admin-sdis88.mmi-stdie.fr/api`) au lieu du proxy Vite.

### Étapes de test

1. **Redémarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

2. **Ouvrir la console du navigateur** (F12 → Console)

3. **Essayer de se connecter** avec le formulaire de login

4. **Vérifier dans la console :**
   - ✅ **Si CORS fonctionne** : Vous verrez `✅ CORS OK - Réponse reçue:` avec les headers
   - ❌ **Si CORS ne fonctionne pas** : Vous verrez `❌ Erreur CORS détectée:` ou une erreur réseau

### Vérification dans l'onglet Network

1. Ouvrir l'onglet **Network** (Réseau) dans les DevTools
2. Faire une requête (ex: login)
3. Cliquer sur la requête vers `https://admin-sdis88.mmi-stdie.fr/api/login`
4. Vérifier les **Response Headers** :
   - `Access-Control-Allow-Origin: http://localhost:3000` ✅
   - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS` ✅
   - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept` ✅
   - `Access-Control-Allow-Credentials: true` ✅

### ⚠️ Note importante

Si vous voyez `status: 200` dans la console, **CORS fonctionne !** 

Le fait que le header `access-control-allow-origin` soit `undefined` dans l'objet Axios est normal :
- Axios ne peut pas toujours lire tous les headers de réponse
- Les headers CORS sont parfois filtrés par le navigateur pour des raisons de sécurité
- **Si CORS ne fonctionnait pas, vous auriez une erreur réseau avant même d'obtenir une réponse 200**

Pour voir les vrais headers HTTP, utilisez l'onglet **Network** des DevTools.

### Test avec curl (optionnel)

```bash
curl -X OPTIONS https://admin-sdis88.mmi-stdie.fr/api/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Vous devriez voir dans les headers de réponse :
```
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
```

## 🔄 Revenir au proxy Vite

Si vous voulez revenir au proxy Vite (qui contourne CORS), modifiez `src/api/axios.js` :

```javascript
const baseURL = import.meta.env.DEV 
  ? '/api'  // Proxy Vite en développement
  : 'https://admin-sdis88.mmi-stdie.fr/api';  // URL complète en production
```
