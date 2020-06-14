import {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode,
} from 'react'
import { useIdeaTextMap } from './AppState'
import { observable, autorun } from 'mobx'
import { useObserver } from 'mobx-react'

type SearchableEntry = { id: string; text: string }

function initializeSearchEngineContext() {
  const store = observable.object(
    {
      data: [] as SearchableEntry[],
      searchEngine: null as import('./SearchEngineBundle').MiniSearch | null,
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
  return {
    async mounted() {
      const { MiniSearch, stemmer, englishStopwords } = await import(
        /* webpackChunkName: "SearchEngineBundle" */ './SearchEngineBundle'
      )
      const searchEngine = new MiniSearch({
        idField: 'id',
        tokenize: (string, _fieldName) => string.match(/\w+/g) || [],
        processTerm: (term, _fieldName) => {
          const stem = stemmer(term)
          const termIsStopword = englishStopwords.has(term)
          return termIsStopword ? null : stem
        },
        fields: ['text'],
        searchOptions: {
          prefix: true,
        },
      })
      autorun(() => {
        searchEngine.addAll(store.data)
      })
      store.searchEngine = searchEngine
    },
    store,
  }
}

type SearchEngineContextType = ReturnType<typeof initializeSearchEngineContext>

const SearchEngineContext = createContext<SearchEngineContextType | null>(null)

export function SearchEngineContextProvider(props: { children: ReactNode }) {
  const [context] = useState(() => initializeSearchEngineContext())
  const ideas = useIdeaTextMap()
  useEffect(() => {
    context.mounted()
  }, [context])
  useEffect(() => {
    context.store.data = Object.keys(ideas).map((id) => ({
      id,
      text: ideas[id],
    }))
  }, [ideas])
  return (
    <SearchEngineContext.Provider value={context}>
      {props.children}
    </SearchEngineContext.Provider>
  )
}

export function useSearchEngineContext() {
  const context = useContext(SearchEngineContext)
  if (!context) {
    throw new Error('No SearchEngineContext provided')
  }
  return context
}

export function useSearchResults(searchText: string) {
  const context = useSearchEngineContext()
  const [localStore] = useState(() => {
    return observable.object(
      {
        searchText: '',
        get results() {
          if (!localStore.searchText || !context.store.searchEngine)
            return undefined
          const searchResults = context.store.searchEngine.search(
            localStore.searchText,
          )
          return Array.from(new Set(searchResults.map((item) => item.id)))
        },
      },
      undefined,
      { deep: false },
    )
  })
  useEffect(() => {
    localStore.searchText = searchText
  }, [searchText])
  return useObserver(() => localStore.results)
}
