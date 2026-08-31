# AI Resume Analyzer

**Intelligent CV Analysis & Job Matching Platform**

Plateforme web permettant à un candidat d'importer son CV (PDF), de coller une offre
d'emploi, puis d'obtenir automatiquement :

- un **Job Match Score** basé sur NLP (TF-IDF + Cosine Similarity) et Machine Learning,
- les compétences détectées / manquantes,
- un résumé professionnel généré par IA générative,
- des recommandations personnalisées,
- des questions d'entretien adaptées au profil et à l'offre.

## Statut du projet

🚧 **En construction — développement phase par phase**

| Phase | Description | Statut |
|-------|-------------|--------|
| 1 | Setup environnement + structure du repo | ✅ En cours |
| 2 | Backend MERN (Express + dépendances) | ⏳ À venir |
| 3 | MongoDB (connexion + modèles) | ⏳ À venir |
| 4 | Authentification (JWT + bcrypt) | ⏳ À venir |
| 5 | Frontend React (Vite + Tailwind) | ⏳ À venir |
| 6 | Upload PDF (Multer) | ⏳ À venir |
| 7 | Extraction texte PDF | ⏳ À venir |
| 8 | Service NLP Python (FastAPI) | ⏳ À venir |
| 9 | Communication Node ↔ Python | ⏳ À venir |
| 10 | Algorithme Job Match Score | ⏳ À venir |
| 11 | GenAI (résumé, recommandations, questions) | ⏳ À venir |
| 12 | Dashboard React | ⏳ À venir |
| 13 | Historique des analyses | ⏳ À venir |
| 14 | Tests | ⏳ À venir |

## Architecture

```
React Frontend  ──HTTP/REST──▶  Express / Node.js  ──▶  MongoDB
                                        │
                                        ├──HTTP──▶  FastAPI (NLP/ML)
                                        │
                                        └──HTTP──▶  AI API (GenAI)
```

## Structure du repository

```text
ai-resume-analyzer/
├── client/          # Frontend React (Vite)
├── server/          # Backend Express / Node.js
├── ml-service/       # Service NLP/ML en Python (FastAPI)
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Prérequis (environnement local)

Ces outils doivent être installés sur votre machine avant de commencer :

| Outil | Usage | Vérifier |
|---|---|---|
| [Node.js](https://nodejs.org/) (v18+) | Backend + Frontend | `node -v` |
| npm | Gestionnaire de paquets Node | `npm -v` |
| [Git](https://git-scm.com/) | Contrôle de version | `git --version` |
| [MongoDB](https://www.mongodb.com/try/download/community) | Base de données (local ou Atlas) | `mongod --version` |
| [Python](https://www.python.org/) (3.10+) | Service NLP/ML | `python --version` |
| [VS Code](https://code.visualstudio.com/) (recommandé) | Éditeur | — |

## Prochaines étapes

La **Phase 2** créera le backend Express (`server/`) avec toutes ses dépendances
(`express`, `mongoose`, `multer`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`,
`dotenv`, `pdf-parse`, `axios`, `express-validator`) ainsi que le squelette
`app.js` / `server.js` avec une route `GET /api/health`.

## Sécurité

- Les clés API et secrets ne sont **jamais** commités (`.env` est ignoré par git).
- Les mots de passe sont hashés avec bcrypt.
- L'authentification utilise JWT.
- Aucune clé API n'est exposée côté client (React).
