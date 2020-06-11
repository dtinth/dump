import { useIdeaTitle } from './AppState'

export function IdeaTitle(props: { ideaId: string }) {
  const { ideaId } = props
  const title = useIdeaTitle(ideaId)
  return <span>{title ?? '…'}</span>
}
