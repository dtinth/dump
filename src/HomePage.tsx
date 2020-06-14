import { Suspense, useCallback, useRef, useState } from 'react'
import { useRecentIdeasIds } from './AppState'
import { NewIdeaForm } from './NewIdeaForm'
import { IdeaBlockLink } from './IdeaBlockLink'
import { useSearchResults } from './SearchEngine'

export function HomePage() {
  const [searchText, setSearchText] = useState('')
  const searchResults = useSearchResults(searchText)
  const onIdle = useOnIdle()
  return (
    <div className="max-w-2xl">
      <h1 className="text-#8b8685 font-bold">Ideas</h1>

      <NewIdeaForm onTextChange={(text) => onIdle(() => setSearchText(text))} />
      <Suspense fallback={'Loading...'}>
        <RecentIdeas searchResults={searchResults} />
      </Suspense>
    </div>
  )
}

function useOnIdle() {
  const queued = useRef<() => void>()
  return useCallback((f: () => void) => {
    if (!queued.current) {
      ;((window as any).requestIdleCallback || requestAnimationFrame)(() => {
        queued.current?.()
        queued.current = undefined
      })
    }
    queued.current = f
  }, [])
}

function RecentIdeas(props: { searchResults?: string[] }) {
  const ideaIds = useRecentIdeasIds()
  return (
    <div>
      {(props.searchResults || ideaIds).map((id) => {
        return (
          <div className="mt-4" key={id}>
            <IdeaBlockLink ideaId={id} />
          </div>
        )
      })}
    </div>
  )
}
