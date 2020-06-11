import './_app.css'
import { AppStateProvider } from '../src/AppState'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AppStateProvider>
      <Head>
        <link rel="icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </AppStateProvider>
  )
}
