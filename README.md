[![Typing SVG](https://readme-typing-svg.demolab.com?font=Audiowide&pause=1000&color=A81D1D&center=true&vCenter=true&random=true&width=435&lines=Owner%3Ajeff_mitsuki;Pwopriyet%C3%A8%3Ajeff_mitsuki;Propri%C3%A9taire%3A+jeff_mitsuki)](https://git.io/typing-svg)
# GitHub ZIP Uploader | Telechargeur GitHub ZIP

## 📎 https://uploadhub-zip.onrender.com

<div align="center">

```


===============================================================
  =                                                             =
  =    #######  ##  #####      ##  ##  #####   ##     #####    =
  =      ###    ##  ##  ##     ##  ##  ##  ##  ##    ##   ##   =
  =      ##     ##  #####      ##  ##  #####   ##    ##   ##   =
  =      ##     ##  ##         ##  ##  ##      ##    ##   ##   =
  =    #######  ##  ##          ####   ##      #####  #####    =
  =                                                             =
  ===============================================================
```

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mitsukisegondconpte)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

</div>

---

## 🌟 Vue d'ensemble | Overview | Rezime

**Une application web moderne et securisee pour extraire et uploader automatiquement des fichiers ZIP vers des depots GitHub.**

*A modern and secure web application for automatically extracting and uploading ZIP files to GitHub repositories.*

*Yon aplikasyon web moden ak sekirite pou retire ak upload otomatikman fichye ZIP yo nan depo GitHub yo.*

### ✨ Fonctionnalités principales | Key Features | Karakteristik yo

- **Authentification securisee** - Utilisation de tokens GitHub pour un acces securise  
- **Structure preservee** - Maintient l'organisation des dossiers lors de l'upload  
- **Suivi en temps reel** - Progression detaillee avec logs en temps reel  
- **Interface intuitive** - Design moderne et facile a utiliser  
- **Multilingue** - Support francais, creole et anglais  

---

## 🚀 Installation et Démarrage | Installation & Setup | Enstalasyon

### Prérequis | Prerequisites | Sa ou bezwen

- Node.js 18+ 
- NPM ou Yarn
- Token GitHub avec permissions `repo` et `contents`

### Installation rapide | Quick Setup | Enstalasyon rapid

```bash
# Clone li depo a | Clone the repository
git clone https://github.com/mitsukisegondconpte/github-zip-uploader.git
cd github-zip-uploader

# Install dependencies | Enstale depo yo
npm install

# Start development server | Kòmanse sèvè devlopman an
npm run dev
```

L'application sera accessible sur `http://localhost:5000` 🎉

---

## 🛠️ Utilisation | Usage | Kijan pou w sèvi ak li

### 1. Configuration GitHub

1. **Obtenir un token GitHub** :
   - Allez sur GitHub → Settings → Developer settings → Personal access tokens
   - Créez un nouveau token avec les permissions `repo` et `contents`

2. **Configurer l'application** :
   - Entrez votre token GitHub
   - Spécifiez l'URL de votre dépôt GitHub
   - Validez la connexion

### 2. Upload de fichiers

1. **Sélectionner votre fichier ZIP** (max 100MB)
2. **Configurer les options** :
   - Branche cible (défaut: `main`)
   - Message de commit personnalisé
   - Préservation de la structure des dossiers
   - Écrasement des fichiers existants

3. **Lancer l'upload** et suivre la progression en temps réel

---

## 🏗️ Architecture Technique | Technical Architecture

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling rapide
- **Tailwind CSS** + **Shadcn/ui** pour le design
- **TanStack Query** pour la gestion d'état
- **Wouter** pour le routing

### Backend
- **Express.js** avec TypeScript
- **Multer** pour l'upload de fichiers
- **JSZip** pour l'extraction des archives
- **Octokit** pour l'intégration GitHub API
- **Stockage en mémoire** pour les jobs d'upload

### Stack complet
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  Express API    │◄──►│   GitHub API    │
│   (Port 5000)   │    │   (TypeScript)  │    │   (Octokit)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/github/validate` | Valide token et dépôt GitHub |
| `POST` | `/api/upload` | Lance l'upload d'un fichier ZIP |
| `GET` | `/api/upload/:jobId` | Récupère le statut d'un job |
| `POST` | `/api/test-zip/create` | Génère un ZIP de test |
| `POST` | `/api/project-zip/create` | Télécharge le code source |

---

## 🔧 Configuration | Konfigirasyon

### Variables d'environnement

```env
NODE_ENV=development
PORT=5000
# Aucune base de données requise - stockage en mémoire
```

### Personnalisation

Le projet utilise **Tailwind CSS** avec des variables CSS personnalisées :

```css
:root {
  --github-blue: hsl(207, 90%, 54%);
  --github-green: hsl(142, 70%, 45%);
  --github-gray: hsl(220, 9%, 46%);
}
```

---

## 🚨 Sécurité | Security | Sekirite

- ✅ **Tokens jamais stockés** - Utilisation temporaire uniquement
- ✅ **Validation stricte** - Vérification des permissions GitHub
- ✅ **Limite de taille** - Fichiers ZIP max 100MB
- ✅ **Types de fichiers** - Seuls les ZIP sont acceptés
- ✅ **HTTPS** - Communication sécurisée avec GitHub

---

## 🐛 Résolution de problèmes | Troubleshooting

### Erreurs courantes | Common Issues

**❌ "Token GitHub invalide"**
- Vérifiez que votre token a les bonnes permissions
- Assurez-vous qu'il n'est pas expiré

**❌ "Dépôt non trouvé"**  
- Vérifiez l'URL du dépôt
- Confirmez que vous avez accès en écriture

**❌ "Fichier trop volumineux"**
- Les fichiers ZIP sont limités à 100MB
- Compressez davantage ou divisez en plusieurs archives

---

## 🤝 Contribution | Contributing

Les contributions sont les bienvenues ! | Contributions are welcome!

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/ma-nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout: nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/ma-nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📞 Contact | Kontak

<div align="center">

### 👨‍💻 **Jeff Mitsuki** - *Développeur Principal | Main Developer*

<div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/50936846133)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/jeff_mitsuki)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mitsukisegondconpte)

</div>

```
📱 WhatsApp: +509 36846133
💬 Telegram: @jeff_mitsuki  
🐙 GitHub: @mitsukisegondconpte
```

</div>

---

## 📄 Licence | License | Lisans

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

*This project is licensed under the MIT License. See the `LICENSE` file for details.*

*Pwojè sa a gen lisans MIT. Gade fichye `LICENSE` a pou plis detay.*

---

<div align="center">

### 🌟 Si ce projet vous aide, n'hésitez pas à lui donner une étoile ! ⭐

```
╔════════════════════════════════════════════════════════════════╗
║  Fait avec ❤️ par Jeff Mitsuki | Made with ❤️ by Jeff Mitsuki  ║
║              © 2025 - Tous droits réservés                     ║
╚════════════════════════════════════════════════════════════════╝
```

</div>
