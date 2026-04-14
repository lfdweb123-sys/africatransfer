// pages/_app.tsx
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../lib/auth-context'
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        {/* Favicon basique */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PNG favicons pour différentes résolutions */}
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        
        {/* Apple Touch Icon pour iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Android Chrome */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color pour la barre d'adresse */}
        <meta name="theme-color" content="#C9972A" />
        
        {/* Windows Metro */}
        <meta name="msapplication-TileColor" content="#C9972A" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
      </Head>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0A0A0A',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontSize: '14px',
            padding: '12px 16px',
            border: '1px solid #262626',
          },
          success: {
            iconTheme: { primary: '#C9972A', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
          },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  )
}