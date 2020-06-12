import { IdeaCard } from './IdeaCard'
import { useIdea, useLinkedIdeas, useBreadcrumb } from './AppState'
import { NewIdeaForm } from './NewIdeaForm'
import { Link } from 'react-router-dom'
import Octicon, { Home } from '@primer/octicons-react'
import { IdeaTitle } from './IdeaTitle'

export function IdeaViewer(props: { ideaId: string }) {
  const idea = useIdea(props.ideaId)
  if (!idea) {
    return <>Not found</>
  }
  return (
    <>
      <IdeaBreadcrumb ideaId={props.ideaId} />
      <div className="mt-4">
        <IdeaCard idea={idea} />
      </div>
      <h1 className="text-#8b8685 font-bold mt-8">Linked ideas</h1>
      <NewIdeaForm parentIdeaId={String(props.ideaId)} />
      <LinkedIdeas parentIdeaId={String(props.ideaId)} />
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

function LinkedIdeas(props: { parentIdeaId: string }) {
  const ideas = useLinkedIdeas(props.parentIdeaId)
  return (
    <div>
      {ideas.map((idea) => {
        return (
          <div className="mt-4" key={idea.ideaId}>
            <IdeaCard idea={idea} />
          </div>
        )
      })}
    </div>
  )
}
