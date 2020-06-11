import './_app.css'
import { AppStateProvider } from '../src/AppState'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AppStateProvider>
      <Head>
        <link rel="icon" href="/icon.svg" />
      </Head>
      <Component {...pageProps} />
    </AppStateProvider>
  )
}
