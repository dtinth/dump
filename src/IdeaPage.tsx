import Head from 'next/head'
import { Suspense } from 'react'
import { ClientSideGuard } from './ClientSideGuard'
import { IdeaViewer } from './IdeaViewer'

export function IdeaPage(props: { id: string }) {
  const id = props.id
  return (
    <div>
      <Head>
        <title>dump</title>
      </Head>
      <div className="max-w-2xl">
        {id && (
          <>
            <ClientSideGuard>
              <Suspense fallback={'Loading...'}>
                <IdeaViewer key={String(id)} ideaId={String(id)} />
              </Suspense>
            </ClientSideGuard>
          </>
        )}
      </div>
    </div>
  )
}
