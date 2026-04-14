import Head from 'next/head'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Envoyer via Brevo
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Message envoyé !')
      } else {
        throw new Error('Erreur')
      }
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Contact — AfricaTransfer</title>
        <meta name="description" content="Contactez l'équipe AfricaTransfer pour toute question ou demande de support." />
      </Head>

      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="divider mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Contactez-nous
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Une question, un problème ou une idée ? Notre équipe vous répond en moins de 24h.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Left — infos */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-gray-900 mb-4">Informations de contact</h2>
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Mail size={18} style={{ color: '#C9972A' }} />,
                        label: 'Email général',
                        value: 'contact@africatransfer.com',
                        href: 'mailto:contact@africatransfer.com',
                      },
                      {
                        icon: <Mail size={18} style={{ color: '#C9972A' }} />,
                        label: 'Support technique',
                        value: 'support@africatransfer.com',
                        href: 'mailto:support@africatransfer.com',
                      },
                      {
                        icon: <MapPin size={18} style={{ color: '#C9972A' }} />,
                        label: 'Localisation',
                        value: 'Cotonou, Bénin 🇧🇯',
                        href: null,
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 card">
                        <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} className="text-sm font-medium text-gray-900 hover:text-yellow-600 transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response time */}
                <div className="card p-5 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={16} style={{ color: '#C9972A' }} />
                    <span className="text-sm font-medium text-gray-900">Temps de réponse</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nous répondons généralement dans les <strong>24 heures</strong> les jours ouvrables.
                  </p>
                </div>

                {/* FAQ link */}
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare size={16} style={{ color: '#C9972A' }} />
                    <span className="text-sm font-medium text-gray-900">FAQ</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Consultez notre FAQ avant de nous écrire, votre réponse s'y trouve peut-être déjà.
                  </p>
                  <a href="/pricing#faq" className="text-sm text-yellow-600 hover:underline flex items-center gap-1">
                    Voir la FAQ <ArrowRight size={12} />
                  </a>
                </div>
              </div>

              {/* Right — form */}
              <div className="lg:col-span-2">
                {sent ? (
                  <div className="card p-10 text-center animate-slide-up">
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h2>
                    <p className="text-gray-500 text-sm mb-6">
                      Merci pour votre message. Nous vous répondrons à <strong>{form.email}</strong> dans les plus brefs délais.
                    </p>
                    <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                      className="text-sm text-yellow-600 hover:underline">
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <div className="card p-8 animate-slide-up">
                    <h2 className="font-semibold text-gray-900 mb-6">Envoyer un message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom complet</label>
                          <input type="text" required className="input-field" placeholder="Votre nom"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                          <input type="email" required className="input-field" placeholder="vous@exemple.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Sujet</label>
                        <select required className="input-field"
                          value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                          <option value="">Choisissez un sujet</option>
                          <option value="support">Problème technique / Support</option>
                          <option value="billing">Facturation / Paiement</option>
                          <option value="partnership">Partenariat / Business</option>
                          <option value="feature">Suggestion de fonctionnalité</option>
                          <option value="abuse">Signalement d'abus</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                        <textarea required className="input-field resize-none" rows={6}
                          placeholder="Décrivez votre demande en détail..."
                          value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                      </div>

                      <button type="submit" disabled={loading}
                        className="btn-gold w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none">
                        {loading
                          ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                          : <><Send size={16} /> Envoyer le message</>
                        }
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
