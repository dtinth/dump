import { Link } from 'react-router-dom'
import { IdeaTitle } from './IdeaTitle'

export function IdeaBlockLink(props: { ideaId: string }) {
  const { ideaId } = props
  return (
    <Link to={`/idea/${ideaId}`} className="text-#ffffbb block">
      <div className="text-#8b8685 text-sm">{ideaId}</div>
      <span className="text-lg">
        <IdeaTitle ideaId={ideaId} />
      </span>
    </Link>
  )
}
