# AfricaTransfer 🌍

Plateforme SaaS de transfert de fichiers conçue pour l'Afrique.  
Stack : **Next.js 14** · **Firebase** · **Vercel** · **FeexPay** · **Brevo**

---

## 🚀 Fonctionnalités

- ✅ Upload de fichiers sans compte obligatoire
- ✅ Upload en chunks (5 Mo) avec reprise automatique
- ✅ Liens de partage uniques et sécurisés
- ✅ Protection par mot de passe
- ✅ QR Code de partage
- ✅ Expiration automatique : 7 jours (gratuit) / 1 an (premium)
- ✅ Notifications par email (Brevo)
- ✅ Paiement Mobile Money via FeexPay (MTN, Moov, Orange)
- ✅ Tableau de bord utilisateur
- ✅ API REST publique (Premium)
- ✅ Nettoyage automatique des fichiers expirés (cron Vercel)
- ✅ Design blanc, noir et or — professionnel

---

## 📋 Prérequis

- Node.js 18+
- Compte Firebase (Spark plan suffit pour commencer)
- Compte Vercel
- Compte Brevo (gratuit jusqu'à 300 emails/jour)
- Compte FeexPay (inscription sur feexpay.me)

---

## ⚙️ Installation locale

```bash
git clone https://github.com/votre-repo/africatransfer.git
cd africatransfer
npm install
cp .env.local.example .env.local
# Remplissez .env.local avec vos clés
npm run dev
```

---

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créez un nouveau projet "africatransfer"
3. Activez **Firestore Database** (mode production)
4. Activez **Firebase Storage**
5. Activez **Authentication** → Email/Password + Google

### 2. Obtenir les clés client
Dans Paramètres du projet → Vos applications → Web :
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Clé de compte de service (Admin SDK)
Dans Paramètres → Comptes de service → Générer une nouvelle clé privée :
```
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
⚠️ Dans Vercel, collez la clé privée sans les guillemets externes, en gardant les `\n`.

### 4. Déployer les règles Firestore & Storage
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

---

## 📧 Configuration Brevo

1. Créez un compte sur [brevo.com](https://www.brevo.com)
2. Allez dans SMTP & API → Clés API
3. Créez une clé API et copiez-la :
```
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@africatransfer.com
BREVO_SENDER_NAME=AfricaTransfer
```
4. Vérifiez votre domaine d'envoi dans les paramètres Brevo

---

## 💰 Configuration FeexPay

1. Créez un compte sur [feexpay.me](https://feexpay.me)
2. Créez une boutique "AfricaTransfer"
3. Récupérez votre API Key et Shop ID :
```
FEEXPAY_API_KEY=...
FEEXPAY_SHOP_ID=...
FEEXPAY_CALLBACK_URL=https://africatransfer.com/api/payments/webhook
```

---

## 🌐 Déploiement sur Vercel

### 1. Pusher sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-repo/africatransfer.git
git push -u origin main
```

### 2. Importer sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. "New Project" → Importez votre repo GitHub
3. Framework : **Next.js** (auto-détecté)

### 3. Variables d'environnement sur Vercel
Dans Settings → Environment Variables, ajoutez **toutes** les variables de `.env.local.example`.

Pour `FIREBASE_ADMIN_PRIVATE_KEY` sur Vercel :
- Collez la valeur brute avec les `\n` réels (pas échappés)
- Ou utilisez la syntaxe : `-----BEGIN PRIVATE KEY-----\nABCD...\n-----END PRIVATE KEY-----\n`

### 4. Cron job (nettoyage automatique)
Le fichier `vercel.json` configure un cron à 2h du matin chaque nuit.  
Ajoutez la variable :
```
CRON_SECRET=votre_secret_tres_long_et_aleatoire
```
Le cron appellera `/api/cron/cleanup?secret=CRON_SECRET` automatiquement.

### 5. Variables supplémentaires
```
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
JWT_SECRET=votre_secret_jwt_min_32_chars
CRON_SECRET=votre_secret_cron
```

---

## 📁 Structure du projet

```
africatransfer/
├── pages/
│   ├── index.tsx              # Page d'accueil + upload
│   ├── pricing.tsx            # Tarifs
│   ├── about.tsx              # À propos
│   ├── checkout.tsx           # Paiement Premium
│   ├── 404.tsx                # Page 404
│   ├── auth/
│   │   ├── login.tsx          # Connexion
│   │   ├── register.tsx       # Inscription
│   │   └── forgot-password.tsx
│   ├── d/[shareId]/
│   │   ├── index.tsx          # Page de téléchargement
│   │   └── qr.tsx             # QR Code
│   ├── dashboard/
│   │   ├── index.tsx          # Tableau de bord
│   │   ├── transfers.tsx      # Liste des transferts
│   │   └── settings.tsx       # Paramètres
│   ├── legal/
│   │   ├── privacy.tsx        # CGU
│   │   └── terms.tsx          # Politique de confidentialité
│   └── api/
│       ├── transfers/
│       │   ├── create.ts      # Créer un transfert
│       │   ├── finalize.ts    # Finaliser + envoyer emails
│       │   ├── verify-password.ts
│       │   └── download.ts    # Logger un téléchargement
│       ├── upload/
│       │   ├── init.ts        # Initier un upload chunked
│       │   ├── chunk.ts       # Recevoir un chunk
│       │   └── complete.ts    # Assembler les chunks
│       ├── payments/
│       │   ├── initiate.ts    # Initier paiement FeexPay
│       │   └── webhook.ts     # Webhook FeexPay
│       ├── auth/
│       │   └── welcome.ts     # Email de bienvenue
│       ├── cron/
│       │   └── cleanup.ts     # Nettoyage fichiers expirés
│       └── v1/
│           └── transfers.ts   # API publique (Premium)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── UploadZone.tsx         # Drag & drop
│   └── TransferForm.tsx       # Formulaire complet
├── lib/
│   ├── firebase.ts            # Firebase client
│   ├── firebase-admin.ts      # Firebase Admin (server)
│   ├── auth-context.tsx       # Context d'authentification
│   ├── brevo.ts               # Emails transactionnels
│   ├── feexpay.ts             # Paiement Mobile Money
│   └── types.ts               # Types TypeScript + plans
├── styles/
│   └── globals.css            # Styles globaux (or, blanc, noir)
├── firestore.rules            # Règles Firestore
├── storage.rules              # Règles Storage
├── firestore.indexes.json     # Index Firestore
├── vercel.json                # Config Vercel + cron
└── .env.local.example         # Template des variables
```

---

## 🎨 Design

Charte graphique :
- **Blanc** (#FFFFFF) — fond principal
- **Noir** (#0A0A0A) — textes, header sombre
- **Or** (#C9972A → #E4B84A) — accents, boutons, logo
- Typographie : **Cormorant Garamond** (display) + **DM Sans** (corps)

---

## 🔑 API Publique (Premium)

```bash
# Lister vos transferts
GET https://africatransfer.com/api/v1/transfers
Authorization: Bearer <firebase_id_token>

# Supprimer un transfert
DELETE https://africatransfer.com/api/v1/transfers?shareId=ABC123
Authorization: Bearer <firebase_id_token>
```

---

## 🛡️ Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- URLs Firebase signées (durée limitée)
- Règles Firestore et Storage restrictives
- Tokens JWT pour les routes API admin
- CRON protégé par secret

---

## 📞 Support

- Email : support@africatransfer.com
- Documentation API : africatransfer.com/docs (à venir)
