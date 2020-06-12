import { getDB } from './DataStore'
import produce from 'immer'
import { useEffect } from 'react'
import { observable } from 'mobx'
import { useObserver } from 'mobx-react'
import { AnyEventType, EventObject } from './DataModel'

export type Idea = {
  ideaId: string
  updatedAt: string
  blocks: string[]
  parentIdeaIds: string[]
}

export type Block = {
  text: string
}

type AppState = {
  ideas: { [id: string]: Idea }
  blocks: { [id: string]: Block }
}

const initialState: AppState = {
  ideas: {},
  blocks: {},
}

const appState = observable.box(initialState, { deep: false })

type EventHandlerBuilder<R extends AnyEventType = AnyEventType> = {
  handle<K extends R>(
    type: K,
    handler: (state: AppState, event: EventObject<K>) => void,
  ): EventHandlerBuilder<Exclude<R, K>>
}

type EventHandler = (state: AppState, event: EventObject) => void

const createEventHandler = (
  builderCallback: (builder: EventHandlerBuilder) => EventHandlerBuilder<never>,
): EventHandler => {
  const map = new Map<AnyEventType, EventHandler>()
  const builder: EventHandlerBuilder = {
    handle: (type, handler) => {
      map.set(type, handler as any)
      return builder
    },
  }
  builderCallback(builder)
  return (state, event) => {
    const foundHandler = map.get(event.type)
    if (foundHandler) {
      foundHandler(state, event)
    }
  }
}

const eventHandler = createEventHandler((builder) =>
  builder
    .handle('new idea', (state, event) => {
      const { payload } = event
      const ideaId = payload.ideaId
      state.ideas[ideaId] = {
        ideaId: ideaId,
        blocks: [ideaId],
        updatedAt: event.time,
        parentIdeaIds: payload.parentIdeaId ? [payload.parentIdeaId] : [],
      }
      state.blocks[ideaId] = {
        text: payload.text,
      }
    })
    .handle('edit block text', (state, event) => {
      const { payload } = event
      const block = state.blocks[payload.blockId]
      if (block) {
        block.text = payload.text
      }
      // TODO: a black may move parent, may not have matching id as idea
      // we must maintain an index from block->idea
      if (state.ideas[payload.blockId]) {
        state.ideas[payload.blockId].updatedAt = event.time
      }
    }),
)

const appStateManager = (() => {
  const eventMap = new Map<string, EventObject>()
  return {
    getAllEvents: () => {
      return Array.from(eventMap.keys())
        .sort()
        .map((key) => eventMap.get(key)!)
    },
    getNextState: (newEvents: EventObject[] = []) => {
      for (const event of newEvents) {
        eventMap.set(event._id, event)
      }
      let state = initialState
      for (const key of Array.from(eventMap.keys()).sort()) {
        const event = eventMap.get(key)!
        state = produce(state, (state) => {
          eventHandler(state, event)
        })
      }
      return state
    },
  }
})()

export function AppStateProvider(props: { children: React.ReactNode }) {
  useEffect(() => {
    Object.assign(window, {
      DUMP: {
        getAppState() {
          return appState.get()
        },
        getEvents() {
          return appStateManager.getAllEvents()
        },
      },
    })
    async function loadDocs() {
      const docs = await getDB().allDocs({ include_docs: true })
      const rows = docs.rows.map((row) => row.doc!)
      appState.set(appStateManager.getNextState(rows))
    }
    getDB()
      .changes({
        since: 'now',
        live: true,
        include_docs: true,
      })
      .on('change', function (change) {
        if (change.deleted) return
        appState.set(appStateManager.getNextState([change.doc!]))
      })
      .on('error', function (err) {
        alert('error')
      })
    loadDocs()
  }, [])
  return <>{props.children}</>
}

export function useRecentIdeasIds() {
  return useObserver(() =>
    Object.values(appState.get().ideas)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map((idea) => idea.ideaId),
  )
}

export function useRecentIdeas() {
  return useObserver(() =>
    Object.values(appState.get().ideas).sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1,
    ),
  )
}

export function useLinkedIdeas(parentIdeaId: string) {
  return useObserver(() =>
    useRecentIdeas().filter((idea) =>
      idea.parentIdeaIds.includes(parentIdeaId),
    ),
  )
}

export function useIdea(id: string) {
  return useObserver(() => appState.get().ideas[id])
}

export function useIdeaTitle(id: string) {
  return useObserver(() => {
    const idea = appState.get().ideas[id]
    if (!idea) return null
    for (const blockId of idea.blocks) {
      const block = appState.get().blocks[blockId]
      if (!block) continue
      const match = block.text.match(/^\s*(?:#+\s*)?(.+)/)
      if (!match) continue
      return match[1]
    }
    return null
  })
}

export function useBlock(id: string) {
  return useObserver(() => appState.get().blocks[id])
}

export function useBreadcrumb(id: string) {
  return useObserver(() => {
    type Node = { id: string; depth: number }
    const out: Node[] = []
    const seen = new Set<string>()
    const queue = (appState.get().ideas[id]?.parentIdeaIds ?? []).map(
      (id): Node => ({
        id,
        depth: 1,
      }),
    )
    while (queue.length > 0) {
      const node = queue.shift()!
      const { id, depth } = node
      if (seen.has(id)) continue
      seen.add(id)
      out.push(node)
      const parents = appState.get().ideas[id]?.parentIdeaIds ?? []
      for (const id of parents) {
        if (seen.has(id)) continue
        queue.push({ id, depth: depth + 1 })
      }
    }
    console.log(out)
    return out
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .sort((a, b) => b.depth - a.depth)
      .map((r) => r.id)
  })
}
