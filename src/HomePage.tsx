import { Suspense } from 'react'
import { useRecentIdeasIds } from './AppState'
import { NewIdeaForm } from './NewIdeaForm'
import { IdeaBlockLink } from './IdeaBlockLink'

export function HomePage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-#8b8685 font-bold">Ideas</h1>

      <NewIdeaForm />
      <Suspense fallback={'Loading...'}>
        <RecentIdeas />
      </Suspense>
    </div>
  )
}

function RecentIdeas() {
  const ideaIds = useRecentIdeasIds()
  return (
    <div>
      {ideaIds.map((id) => {
        return (
          <div className="mt-4" key={id}>
            <IdeaBlockLink ideaId={id} />
          </div>
        )
      })}
    </div>
  )
}
