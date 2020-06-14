import './_app.css'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-startup-image"
          sizes="2048x2732"
          href="/apple-launch-image.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
