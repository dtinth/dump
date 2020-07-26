import { IdeaCard } from './IdeaCard'
import { useIdea, useBreadcrumb, useIdeaText } from './AppState'
import { NewIdeaForm } from './NewIdeaForm'
import { Link } from 'react-router-dom'
import Octicon, { Home } from '@primer/octicons-react'
import { IdeaTitle } from './IdeaTitle'
import { AppErrorBoundary } from './AppErrorBoundary'
import { useSearchResults } from './SearchEngine'
import { IdeaBlockLink } from './IdeaBlockLink'

export function IdeaViewer(props: { ideaId: string }) {
  const idea = useIdea(props.ideaId)
  if (!idea) {
    return <>Not found</>
  }
  return (
    <>
      <AppErrorBoundary>
        <IdeaBreadcrumb ideaId={props.ideaId} />
      </AppErrorBoundary>
      <div className="mt-4">
        <AppErrorBoundary>
          <IdeaCard idea={idea} />
        </AppErrorBoundary>
      </div>
      <h1 className="text-#8b8685 font-bold mt-8">Create a sub-idea</h1>
      <AppErrorBoundary>
        <NewIdeaForm
          draftId={`IdeaViewer-${props.ideaId}`}
          parentIdeaId={String(props.ideaId)}
        />
      </AppErrorBoundary>
      <h1 className="text-#8b8685 font-bold mt-8">Related ideas</h1>
      <AppErrorBoundary>
        <RelatedIdeas parentIdeaId={String(props.ideaId)} />
      </AppErrorBoundary>
    </>
  )
}

function IdeaBreadcrumb(props: { ideaId: string }) {
  const breadcrumb = useBreadcrumb(props.ideaId)

  return (
    <nav className="text-#8b8685">
      <Link to="/" className="inline-block align-middle">
        <Octicon icon={Home} />
      </Link>
      {breadcrumb.map((parentIdeaId) => {
        return (
          <>
            {' '}
            <Link
              to={`/idea/${parentIdeaId}`}
              className="inline-block align-middle px-2 py-1"
            >
              <span className="text-sm block">{parentIdeaId}</span>
              <IdeaTitle ideaId={parentIdeaId} />
            </Link>
          </>
        )
      })}
    </nav>
  )
}

function RelatedIdeas(props: { parentIdeaId: string }) {
  const related = useSearchResults(useIdeaText(props.parentIdeaId))
  return (
    <div>
      {(related || [])
        .filter((id) => id !== props.parentIdeaId)
        .slice(0, 8)
        .map((id) => {
          return (
            <div className="mt-4" key={id}>
              <IdeaBlockLink ideaId={id} />
            </div>
          )
        })}
    </div>
  )
}
