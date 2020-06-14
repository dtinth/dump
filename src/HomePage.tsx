import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRecentIdeasIds, useIdeaTextMap } from './AppState'
import { NewIdeaForm } from './NewIdeaForm'
import { IdeaBlockLink } from './IdeaBlockLink'
import { observable, autorun } from 'mobx'
import { useObserver } from 'mobx-react'

export function HomePage() {
  const search = useSearchEngine()
  const onIdle = useOnIdle()
  return (
    <div className="max-w-2xl">
      <h1 className="text-#8b8685 font-bold">Ideas</h1>

      <NewIdeaForm
        onTextChange={(text) => onIdle(() => search.setText(text))}
      />
      <Suspense fallback={'Loading...'}>
        <RecentIdeas searchResults={search.results} />
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

function useSearchEngine() {
  const ideas = useIdeaTextMap()
  type SearchableEntry = { id: string; text: string }
  const [store] = useState(() => {
    return observable.object(
      {
        data: [] as SearchableEntry[],
        searchEngine: null as import('./SearchEngine').MiniSearch | null,
        searchText: '',
        get results() {
          if (!store.searchText || !store.searchEngine) return undefined
          const searchResults = store.searchEngine.search(store.searchText)
          return Array.from(new Set(searchResults.map((item) => item.id)))
        },
      },
      undefined,
      { deep: false },
    )
  })
  useEffect(() => {
    store.data = Object.keys(ideas).map((id) => ({ id, text: ideas[id] }))
  }, [ideas])
  useEffect(() => {
    ;(async () => {
      const { MiniSearch, stemmer } = await import('./SearchEngine')
      const searchEngine = new MiniSearch({
        idField: 'id',
        tokenize: (string, _fieldName) => string.match(/\w+/g) || [],
        processTerm: (term, _fieldName) => stemmer(term),
        fields: ['text'],
        searchOptions: {
          prefix: true,
        },
      })
      autorun(() => {
        searchEngine.addAll(store.data)
      })
      store.searchEngine = searchEngine
    })()
  }, [])
  const setText = useCallback((text: string) => {
    store.searchText = text
  }, [])
  return useObserver(() => {
    return {
      results: store.results,
      setText,
    }
  })
}
