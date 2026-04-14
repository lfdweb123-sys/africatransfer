const BREVO_API_URL = 'https://api.brevo.com/v3'

interface EmailOptions {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  replyTo?: { email: string; name?: string }
}

async function sendEmail(options: EmailOptions) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME

  if (!apiKey || !senderEmail) {
    console.error('[BREVO] Variables manquantes: BREVO_API_KEY ou BREVO_SENDER_EMAIL')
    throw new Error('Brevo non configuré')
  }

  const payload = {
    sender: { email: senderEmail, name: senderName || 'AfricaTransfer' },
    ...options,
  }

  console.log('[BREVO] Envoi email à:', options.to.map(t => t.email).join(', '))

  const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[BREVO] Erreur API:', err)
    throw new Error(`Brevo error: ${err}`)
  }

  const result = await response.json()
  console.log('[BREVO] Email envoyé avec succès, messageId:', result.messageId)
  return result
}

// ─── Email: lien de transfert ───────────────────────────────────────────────

export async function sendTransferLinkEmail({
  recipientEmail,
  recipientName,
  senderName,
  senderEmail,
  shareLink,
  message,
  expiresAt,
  totalSize,
  fileCount,
}: {
  recipientEmail: string
  recipientName?: string
  senderName: string
  senderEmail: string
  shareLink: string
  message?: string
  expiresAt: Date
  totalSize: string
  fileCount: number
}) {
  const expiry = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(expiresAt)

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:32px 40px;text-align:center}
  .logo{font-family:Georgia,serif;font-size:24px;color:#C9972A;letter-spacing:.05em}
  .logo span{color:#fff}
  .hero{padding:48px 40px 32px;text-align:center}
  .hero h1{font-size:26px;font-weight:600;color:#0A0A0A;margin-bottom:12px}
  .hero p{font-size:15px;color:#525252;line-height:1.6}
  .sender-tag{display:inline-block;background:#F5F5F5;border:1px solid #E5E5E5;border-radius:8px;padding:6px 14px;font-size:13px;color:#404040;margin-top:16px}
  .cta-section{padding:8px 40px 32px;text-align:center}
  .cta-btn{display:inline-block;background:linear-gradient(135deg,#C9972A,#E4B84A);color:#fff!important;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:500}
  .meta{margin:0 40px 32px;display:flex;gap:16px}
  .meta-item{flex:1;background:#FAFAFA;border:1px solid #E5E5E5;border-radius:10px;padding:16px;text-align:center}
  .meta-item .val{font-size:18px;font-weight:600;color:#C9972A}
  .meta-item .lbl{font-size:12px;color:#737373;margin-top:4px}
  .msg-box{margin:0 40px 32px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:20px}
  .msg-box p{font-size:14px;color:#404040;line-height:1.6;font-style:italic}
  .link-box{margin:16px 40px 32px;background:#FAFAFA;border:1px solid #E5E5E5;border-radius:10px;padding:16px 20px}
  .link-box p{font-size:12px;color:#737373;margin-bottom:8px}
  .link-box code{font-size:13px;color:#C9972A;word-break:break-all}
  .expiry{margin:0 40px 32px;text-align:center}
  .expiry p{font-size:13px;color:#737373}
  .footer{background:#F5F5F5;padding:24px 40px;text-align:center}
  .footer p{font-size:12px;color:#A3A3A3;line-height:1.6}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="hero">
    <h1>Vous avez reçu des fichiers !</h1>
    <p>${senderName} vous a envoyé ${fileCount} fichier${fileCount > 1 ? 's' : ''} via AfricaTransfer</p>
    <div class="sender-tag">De : ${senderName} &lt;${senderEmail}&gt;</div>
  </div>
  <div class="cta-section">
    <a href="${shareLink}" class="cta-btn">Télécharger les fichiers</a>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="val">${fileCount}</div><div class="lbl">Fichier${fileCount > 1 ? 's' : ''}</div></div>
    <div class="meta-item"><div class="val">${totalSize}</div><div class="lbl">Taille totale</div></div>
    <div class="meta-item"><div class="val">${expiry}</div><div class="lbl">Expire le</div></div>
  </div>
  ${message ? `<div class="msg-box"><p>"${message}"</p></div>` : ''}
  <div class="link-box">
    <p>Ou copiez ce lien dans votre navigateur :</p>
    <code>${shareLink}</code>
  </div>
  <div class="expiry">
    <p>⚠️ Ce lien expirera le <strong>${expiry}</strong>. Téléchargez vos fichiers avant cette date.</p>
  </div>
  <div class="footer">
    <p>AfricaTransfer — Transfert de fichiers sécurisé en Afrique<br>
    Vous recevez cet email car ${senderName} a partagé des fichiers avec vous.<br>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject: `${senderName} vous a envoyé ${fileCount} fichier${fileCount > 1 ? 's' : ''} (${totalSize})`,
    htmlContent,
    replyTo: { email: senderEmail, name: senderName },
  })
}

// ─── Email: confirmation téléchargement ────────────────────────────────────

export async function sendDownloadConfirmationEmail({
  ownerEmail,
  ownerName,
  downloaderInfo,
  fileName,
  shareLink,
}: {
  ownerEmail: string
  ownerName: string
  downloaderInfo: string
  fileName: string
  shareLink: string
}) {
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:24px 40px}
  .logo{font-family:Georgia,serif;font-size:20px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:40px}
  .body h2{font-size:22px;font-weight:600;margin-bottom:12px}
  .body p{font-size:14px;color:#525252;line-height:1.6;margin-bottom:16px}
  .info-box{background:#FAFAFA;border:1px solid #E5E5E5;border-radius:10px;padding:20px;margin-bottom:24px}
  .info-box p{margin:0 0 6px;color:#404040;font-size:14px}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5}
  .footer p{font-size:12px;color:#A3A3A3}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <h2>📥 Vos fichiers ont été téléchargés</h2>
    <p>Bonjour ${ownerName},<br>Un de vos transferts vient d'être téléchargé.</p>
    <div class="info-box">
      <p><strong>Fichier :</strong> ${fileName}</p>
      <p><strong>Par :</strong> ${downloaderInfo}</p>
      <p><strong>Lien :</strong> <a href="${shareLink}" style="color:#C9972A">${shareLink}</a></p>
    </div>
    <p style="font-size:13px;color:#737373">Connectez-vous à votre tableau de bord pour gérer vos transferts.</p>
  </div>
  <div class="footer">
    <p>AfricaTransfer — <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email: ownerEmail, name: ownerName }],
    subject: `📥 Vos fichiers "${fileName}" ont été téléchargés`,
    htmlContent,
  })
}

// ─── Email: bienvenue ───────────────────────────────────────────────────────

export async function sendWelcomeEmail({ email, name }: { email: string; name: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://africatransfer-b12m.vercel.app'

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:32px 40px;text-align:center}
  .logo{font-family:Georgia,serif;font-size:24px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:48px 40px;text-align:center}
  .body h1{font-size:28px;font-weight:600;margin-bottom:12px}
  .body p{font-size:15px;color:#525252;line-height:1.6;max-width:440px;margin:0 auto 24px}
  .cta-btn{display:inline-block;background:linear-gradient(135deg,#C9972A,#E4B84A);color:#fff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:500}
  .features{display:grid;gap:16px;margin:32px 0;text-align:left}
  .feat{display:flex;align-items:center;gap:12px;padding:16px;background:#FAFAFA;border-radius:10px}
  .feat-icon{font-size:20px;flex-shrink:0}
  .feat-text h3{font-size:14px;font-weight:600;margin-bottom:4px}
  .feat-text p{font-size:13px;color:#737373;margin:0}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5;text-align:center}
  .footer p{font-size:12px;color:#A3A3A3}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <h1>Bienvenue, ${name} ! 🎉</h1>
    <p>Votre compte AfricaTransfer est créé. Commencez à envoyer vos fichiers en toute sécurité, partout en Afrique.</p>
    <a href="${appUrl}/dashboard" class="cta-btn">Accéder à mon espace</a>
    <div class="features">
      <div class="feat">
        <span class="feat-icon">🚀</span>
        <div class="feat-text">
          <h3>Envoi rapide</h3>
          <p>Jusqu'à 2 Go en plan gratuit, avec reprise automatique</p>
        </div>
      </div>
      <div class="feat">
        <span class="feat-icon">🔒</span>
        <div class="feat-text">
          <h3>Sécurisé</h3>
          <p>Protection par mot de passe, liens uniques</p>
        </div>
      </div>
      <div class="feat">
        <span class="feat-icon">💰</span>
        <div class="feat-text">
          <h3>Mobile Money accepté</h3>
          <p>MTN, Moov, Orange Money pour le plan Premium</p>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>AfricaTransfer — <a href="${appUrl}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email, name }],
    subject: `Bienvenue sur AfricaTransfer, ${name} ! 🎉`,
    htmlContent,
  })
}

// ─── Email: contact admin ───────────────────────────────────────────────────

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const adminEmail = process.env.BREVO_ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL || 'contact@africatransfer.com'

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:24px 40px}
  .logo{font-family:Georgia,serif;font-size:20px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:40px}
  h2{font-size:20px;margin-bottom:24px}
  .field{margin-bottom:20px}
  .label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#737373;margin-bottom:4px}
  .value{font-size:15px;color:#0A0A0A}
  .msg-box{background:#FAFAFA;border:1px solid #E5E5E5;border-radius:10px;padding:20px;margin-top:8px;font-size:14px;line-height:1.7;color:#404040}
  .badge{display:inline-block;background:rgba(201,151,42,.1);color:#A07820;border:1px solid rgba(201,151,42,.3);border-radius:100px;padding:4px 12px;font-size:12px}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5;font-size:12px;color:#A3A3A3}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <h2>Nouveau message de contact</h2>
    <div class="field"><div class="label">Nom</div><div class="value">${name}</div></div>
    <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${email}" style="color:#C9972A">${email}</a></div></div>
    <div class="field"><div class="label">Sujet</div><div class="value"><span class="badge">${subject}</span></div></div>
    <div class="field"><div class="label">Message</div><div class="msg-box">${message.replace(/\n/g, '<br>')}</div></div>
  </div>
  <div class="footer">AfricaTransfer — Message reçu via le formulaire de contact</div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email: adminEmail, name: 'AfricaTransfer Admin' }],
    replyTo: { email, name },
    subject: `[Contact] ${subject} — ${name}`,
    htmlContent,
  })
}

// ─── Email: alerte de connexion ─────────────────────────────────────────────

export async function sendLoginAlertEmail({
  email,
  name,
  ip,
  country,
  city,
  region,
  isp,
  loginAt,
  device,
}: {
  email: string
  name: string
  ip: string
  country: string
  city: string
  region: string
  isp: string
  loginAt: Date
  device: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  const dateStr = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Porto-Novo',
  }).format(loginAt)

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:32px 40px;text-align:center}
  .logo{font-family:Georgia,serif;font-size:24px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:40px}
  .alert-icon{width:56px;height:56px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:24px;text-align:center;line-height:56px}
  h2{font-size:22px;font-weight:600;text-align:center;margin-bottom:8px}
  .subtitle{font-size:14px;color:#737373;text-align:center;margin-bottom:32px}
  .info-grid{background:#FAFAFA;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;margin-bottom:24px}
  .info-row{display:flex;padding:14px 20px;border-bottom:1px solid #F0F0F0}
  .info-row:last-child{border-bottom:none}
  .info-label{font-size:12px;color:#737373;width:120px;flex-shrink:0;padding-top:1px}
  .info-value{font-size:14px;color:#0A0A0A;font-weight:500;word-break:break-all}
  .info-value.ip{font-family:monospace;color:#C9972A;font-size:13px}
  .warning-box{background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:16px 20px;margin-bottom:24px}
  .warning-box p{font-size:13px;color:#9A3412;line-height:1.6}
  .cta-btn{display:inline-block;background:linear-gradient(135deg,#C9972A,#E4B84A);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:500}
  .cta-center{text-align:center;margin-bottom:24px}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5;text-align:center}
  .footer p{font-size:12px;color:#A3A3A3;line-height:1.7}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <div class="alert-icon">🔐</div>
    <h2>Nouvelle connexion détectée</h2>
    <p class="subtitle">Bonjour <strong>${name}</strong>, une connexion à votre compte vient d'être effectuée.</p>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">📅 Date &amp; heure</span>
        <span class="info-value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🌍 Pays</span>
        <span class="info-value">${country}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🏙️ Ville</span>
        <span class="info-value">${city}${region ? ', ' + region : ''}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🌐 Adresse IP</span>
        <span class="info-value ip">${ip}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📡 Fournisseur</span>
        <span class="info-value">${isp}</span>
      </div>
      <div class="info-row">
        <span class="info-label">💻 Appareil</span>
        <span class="info-value">${device}</span>
      </div>
    </div>

    <div class="warning-box">
      <p>⚠️ <strong>Ce n'est pas vous ?</strong> Si vous n'êtes pas à l'origine de cette connexion, sécurisez immédiatement votre compte en changeant votre mot de passe.</p>
    </div>

    <div class="cta-center">
      <a href="${appUrl}/auth/forgot-password" class="cta-btn">Sécuriser mon compte</a>
    </div>
  </div>
  <div class="footer">
    <p>AfricaTransfer — Cet email de sécurité vous est envoyé automatiquement.<br>
    Ne partagez jamais votre mot de passe.<br>
    <a href="${appUrl}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email, name }],
    subject: `🔐 Nouvelle connexion à votre compte AfricaTransfer`,
    htmlContent,
  })
}


// ─── Email: notification réinitialisation mot de passe ──────────────────────

export async function sendResetPasswordEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:32px 40px;text-align:center}
  .logo{font-family:Georgia,serif;font-size:24px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:48px 40px;text-align:center}
  .icon{font-size:40px;margin-bottom:20px}
  h2{font-size:22px;font-weight:600;margin-bottom:10px}
  .subtitle{font-size:14px;color:#737373;line-height:1.6;margin-bottom:28px;max-width:420px;margin-left:auto;margin-right:auto}
  .info-box{background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:16px 20px;margin-bottom:28px;text-align:left}
  .info-box p{font-size:13px;color:#9A3412;line-height:1.6}
  .steps{background:#FAFAFA;border:1px solid #E5E5E5;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:left}
  .step{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
  .step:last-child{margin-bottom:0}
  .step-num{width:22px;height:22px;background:#C9972A;color:#fff;border-radius:50%;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .step-text{font-size:13px;color:#404040;line-height:1.5}
  .cta-btn{display:inline-block;background:linear-gradient(135deg,#C9972A,#E4B84A);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:500}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5;text-align:center}
  .footer p{font-size:12px;color:#A3A3A3;line-height:1.7}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <div class="icon">🔑</div>
    <h2>Réinitialisation de mot de passe</h2>
    <p class="subtitle">
      Bonjour <strong>${name}</strong>, vous avez demandé la réinitialisation de votre mot de passe AfricaTransfer.
      Un lien vous a été envoyé par Firebase à cette adresse email.
    </p>

    <div class="info-box">
      <p>⚠️ <strong>Ce n'est pas vous ?</strong> Si vous n'avez pas fait cette demande, votre compte est peut-être en danger. Connectez-vous immédiatement et changez votre mot de passe.</p>
    </div>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">Ouvrez l'email de réinitialisation envoyé par Firebase (vérifiez les <strong>spams</strong>)</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">Cliquez sur le lien de réinitialisation (valable <strong>1 heure</strong>)</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">Choisissez un nouveau mot de passe <strong>fort et unique</strong></div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text">Reconnectez-vous à votre espace AfricaTransfer</div>
      </div>
    </div>

    <a href="${appUrl}/auth/login" class="cta-btn">Aller à la connexion</a>
  </div>
  <div class="footer">
    <p>AfricaTransfer — Cet email de sécurité est envoyé automatiquement.<br>
    Ne communiquez jamais votre mot de passe à personne.<br>
    <a href="${appUrl}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email, name }],
    subject: `🔑 Réinitialisation de votre mot de passe AfricaTransfer`,
    htmlContent,
  })
}


// ─── Email: confirmation de réception du message contact ────────────────────

export async function sendContactConfirmationEmail({
  name,
  email,
  subject,
}: {
  name: string
  email: string
  subject: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,sans-serif;background:#F5F5F5;color:#0A0A0A}
  .wrapper{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0A0A0A;padding:32px 40px;text-align:center}
  .logo{font-family:Georgia,serif;font-size:24px;color:#C9972A}
  .logo span{color:#fff}
  .body{padding:48px 40px;text-align:center}
  .icon{font-size:42px;margin-bottom:20px}
  h2{font-size:22px;font-weight:600;margin-bottom:10px}
  .subtitle{font-size:15px;color:#525252;line-height:1.7;margin-bottom:28px;max-width:420px;margin-left:auto;margin-right:auto}
  .info-box{background:#FAFAFA;border:1px solid #E5E5E5;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:left}
  .info-row{display:flex;padding:10px 0;border-bottom:1px solid #F0F0F0}
  .info-row:last-child{border-bottom:none}
  .info-label{font-size:12px;color:#737373;width:100px;flex-shrink:0}
  .info-value{font-size:13px;color:#0A0A0A;font-weight:500}
  .cta-btn{display:inline-block;background:linear-gradient(135deg,#C9972A,#E4B84A);color:#fff!important;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:500}
  .footer{padding:24px 40px;border-top:1px solid #E5E5E5;text-align:center}
  .footer p{font-size:12px;color:#A3A3A3;line-height:1.8}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Africa<span>Transfer</span></div></div>
  <div class="body">
    <div class="icon">✉️</div>
    <h2>Message bien reçu !</h2>
    <p class="subtitle">
      Bonjour <strong>${name}</strong>, nous avons bien reçu votre message et nous vous répondrons dans les <strong>24 heures</strong> ouvrables.
    </p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Sujet</span>
        <span class="info-value">${subject}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Envoyé à</span>
        <span class="info-value">${email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Réponse sous</span>
        <span class="info-value">24h ouvrables</span>
      </div>
    </div>

    <a href="${appUrl}" class="cta-btn">Retour à AfricaTransfer</a>
  </div>
  <div class="footer">
    <p>AfricaTransfer — Transfert de fichiers sécurisé en Afrique<br>
    Cet email confirme la réception de votre message.<br>
    <a href="${appUrl}" style="color:#C9972A">africatransfer.com</a></p>
  </div>
</div>
</body>
</html>`

  return sendEmail({
    to: [{ email, name }],
    subject: `✉️ Nous avons bien reçu votre message — AfricaTransfer`,
    htmlContent,
  })
}