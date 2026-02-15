# 🍣 Poké Tea - Installation

## Étape 1 : Installer Node.js
Télécharge et installe Node.js : https://nodejs.org (prends la version LTS)

Vérifie que ça marche :
```bash
node --version
npm --version
```

## Étape 2 : Télécharger le projet
Télécharge le dossier `poketea` complet et mets-le quelque part sur ton PC.

## Étape 3 : Installer les dépendances
Ouvre un terminal dans le dossier du projet :
```bash
cd poketea
npm install
```

## Étape 4 : Importer les produits dans Firebase
```bash
npm run seed
```
Tu verras tous les produits s'ajouter un par un. Vérifie dans la console Firebase > Firestore que la collection "products" est remplie.

## Étape 5 : Créer le compte admin dans Firebase

### A. Créer l'utilisateur
1. Va sur https://console.firebase.google.com
2. Sélectionne ton projet "Poke tea"
3. Menu gauche → Créer → Authentication
4. Onglet "Users" → "Ajouter un utilisateur"
5. Email : admin@poketea.fr (ou ce que tu veux)
6. Mot de passe : choisis un mot de passe fort
7. Clique "Ajouter"
8. **COPIE LE UID** qui apparaît (la longue chaîne de caractères)

### B. Le marquer comme admin
1. Menu gauche → Créer → Firestore Database
2. Clique "Démarrer une collection"
3. ID de collection : `admins`
4. ID du document : **colle le UID copié**
5. Ajoute un champ :
   - Nom : `role`
   - Type : string
   - Valeur : `admin`
6. Ajoute un champ :
   - Nom : `name`
   - Type : string
   - Valeur : `Admin Poké Tea`
7. Clique "Enregistrer"

## Étape 6 : Configurer les règles de sécurité Firestore
1. Console Firebase → Firestore → Onglet "Règles"
2. Remplace tout par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == "admin";
    }
    match /orders/{orderId} {
      allow create: true;
      allow read: true;
      allow update: if request.auth != null;
    }
    match /config/{docId} {
      allow read: true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == "admin";
    }
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: true;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: false;
    }
  }
}
```

3. Clique "Publier"

## Étape 7 : Lancer en local
```bash
npm run dev
```
Ouvre http://localhost:5173 dans ton navigateur.

Pages :
- http://localhost:5173 → Site client
- http://localhost:5173/kitchen → Écran cuisine (login admin requis)

## Étape 8 : Déployer sur Vercel

### A. Mettre sur GitHub
1. Crée un compte sur https://github.com si t'en as pas
2. Crée un nouveau repository "poketea"
3. Depuis le terminal :
```bash
git init
git add .
git commit -m "Poké Tea v1"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/poketea.git
git push -u origin main
```

### B. Déployer
1. Va sur https://vercel.com → connecte-toi avec GitHub
2. Clique "Add New" → "Project"
3. Importe le repo "poketea"
4. Dans "Environment Variables", ajoute CHAQUE variable de ton fichier .env :
   - VITE_FIREBASE_API_KEY = AIzaSyB2ANn4pvAK1HG7Y8Xe_QulSKniUj0ZdlM
   - VITE_FIREBASE_AUTH_DOMAIN = poke-tea.firebaseapp.com
   - VITE_FIREBASE_PROJECT_ID = poke-tea
   - VITE_FIREBASE_STORAGE_BUCKET = poke-tea.firebasestorage.app
   - VITE_FIREBASE_MESSAGING_SENDER_ID = 865008850372
   - VITE_FIREBASE_APP_ID = 1:865008850372:web:758c71821fdaea18ff0091
5. Clique "Deploy"

Ton site sera en ligne en 2 minutes !

## Étape 9 (optionnel) : Nom de domaine
1. Achète poketea-meaux.fr sur https://www.ovh.com/fr/domaines/
2. Dans Vercel → Settings → Domains → ajoute poketea-meaux.fr
3. Configure les DNS chez OVH avec les valeurs données par Vercel
