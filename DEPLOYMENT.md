# Guide de déploiement en production

## 🚀 Prérequis

1. **Infrastructure backend** :
   - Le domaine `jsp-sdis88.mmi-stdie.fr` doit pointer vers le même backend que `admin-sdis88.mmi-stdie.fr`
   - Configuration CORS du backend pour autoriser les requêtes depuis `jsp-sdis88.mmi-stdie.fr`

2. **Serveur web** :
   - Nginx, Apache, ou serveur statique (Netlify, Vercel, etc.)
   - Support des routes SPA (Single Page Application)

---

## 📦 Build de production

### 1. Installer les dépendances

```bash
npm install
```

### 2. Build de production

```bash
npm run build
```

Cela génère un dossier `dist/` avec tous les fichiers statiques optimisés.

### 3. Prévisualiser le build localement

```bash
npm run preview
```

---

## 🌐 Déploiement

### Option 1 : Déploiement sur un serveur statique (Nginx, Apache)

#### Nginx

```nginx
server {
    listen 80;
    server_name jsp-sdis88.mmi-stdie.fr;
    
    root /var/www/frontendJSP/dist;
    index index.html;

    # Gestion des routes SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache (.htaccess)

Créer un fichier `.htaccess` dans le dossier `dist/` :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Option 2 : Déploiement sur Netlify

1. Connecter votre dépôt Git à Netlify
2. Configuration du build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
3. Ajouter une redirection pour les routes SPA dans `netlify.toml` :

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3 : Déploiement sur Vercel

1. Installer Vercel CLI : `npm i -g vercel`
2. Déployer : `vercel --prod`
3. Vercel détecte automatiquement Vite et configure les redirections

---

## ⚙️ Configuration backend requise

### 1. Configuration CORS

Le backend doit autoriser les requêtes depuis `jsp-sdis88.mmi-stdie.fr`.

**Exemple pour Symfony (nelmio_cors.yaml) :**

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: 
            - 'https://jsp-sdis88\.mmi-stdie\.fr'
            - 'https://admin-sdis88\.mmi-stdie\.fr'
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        max_age: 3600
    paths:
        '^/api/': ~
```

### 2. Configuration DNS/Virtual Host

Les deux domaines doivent pointer vers le même backend :

- `admin-sdis88.mmi-stdie.fr` → Backend API
- `jsp-sdis88.mmi-stdie.fr` → Même backend API (alias DNS ou reverse proxy)

**Exemple avec Nginx (reverse proxy) :**

```nginx
# Virtual host pour admin-sdis88
server {
    listen 80;
    server_name admin-sdis88.mmi-stdie.fr;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Virtual host pour jsp-sdis88 (même backend)
server {
    listen 80;
    server_name jsp-sdis88.mmi-stdie.fr;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔍 Vérification en production

### 1. Vérifier les URLs

Après déploiement, vérifiez dans la console du navigateur :

- ✅ Requêtes API : `https://admin-sdis88.mmi-stdie.fr/api/...`
- ✅ Téléchargements : `https://jsp-sdis88.mmi-stdie.fr/api/cours/.../download`

### 2. Tester les fonctionnalités

1. **Connexion** : Vérifier que l'authentification fonctionne
2. **Liste des cours** : Vérifier que les cours s'affichent
3. **Téléchargement** : Vérifier que les téléchargements utilisent `jsp-sdis88`
4. **CORS** : Vérifier qu'il n'y a pas d'erreurs CORS dans la console

### 3. Vérifier les erreurs CORS

Si vous voyez des erreurs CORS :

```
Access to fetch at 'https://jsp-sdis88.mmi-stdie.fr/api/...' from origin 'https://jsp-sdis88.mmi-stdie.fr' has been blocked by CORS policy
```

➡️ Vérifier la configuration CORS du backend pour autoriser `jsp-sdis88.mmi-stdie.fr`

---

## 🐛 Dépannage

### Problème : Les téléchargements ne fonctionnent pas

**Vérifications :**
1. Le domaine `jsp-sdis88.mmi-stdie.fr` pointe-t-il vers le backend ?
2. Le backend accepte-t-il les requêtes depuis `jsp-sdis88.mmi-stdie.fr` ?
3. Les en-têtes CORS sont-ils correctement configurés ?

**Test avec cURL :**

```bash
# Tester si le domaine répond
curl -I https://jsp-sdis88.mmi-stdie.fr/api/cours/1/download \
  -H "Authorization: Bearer YOUR_TOKEN"

# Vérifier les en-têtes CORS
curl -I -X OPTIONS https://jsp-sdis88.mmi-stdie.fr/api/cours/1/download \
  -H "Origin: https://jsp-sdis88.mmi-stdie.fr" \
  -H "Access-Control-Request-Method: GET"
```

### Problème : Erreur 404 sur les routes

**Solution :** Configurer le serveur web pour rediriger toutes les routes vers `index.html` (voir configuration Nginx/Apache ci-dessus).

### Problème : Les assets ne se chargent pas

**Solution :** Vérifier que le chemin de base est correct dans `vite.config.js` si l'application n'est pas à la racine :

```javascript
export default defineConfig({
  base: '/', // ou '/mon-app/' si déployé dans un sous-dossier
  // ...
});
```

---

## 📝 Checklist de déploiement

- [ ] Build de production réussi (`npm run build`)
- [ ] Test local du build (`npm run preview`)
- [ ] Configuration DNS pour `jsp-sdis88.mmi-stdie.fr` pointant vers le backend
- [ ] Configuration CORS du backend pour autoriser `jsp-sdis88.mmi-stdie.fr`
- [ ] Configuration du serveur web (Nginx/Apache) pour les routes SPA
- [ ] Test de connexion en production
- [ ] Test d'affichage des cours
- [ ] Test de téléchargement (vérifier que l'URL utilise `jsp-sdis88`)
- [ ] Vérification des erreurs dans la console du navigateur
- [ ] Test sur différents navigateurs

---

## 🔐 Sécurité en production

1. **HTTPS** : Utiliser SSL/TLS pour tous les domaines
2. **Headers de sécurité** : Ajouter des headers de sécurité (CSP, HSTS, etc.)
3. **Variables d'environnement** : Ne jamais commiter les tokens ou clés secrètes
4. **Rate limiting** : Configurer le rate limiting côté backend

---

## 📞 Support

En cas de problème, vérifier :
1. Les logs du serveur web
2. Les logs du backend
3. La console du navigateur (F12)
4. Les en-têtes HTTP (onglet Network dans les DevTools)


