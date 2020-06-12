import PouchDB from 'pouchdb'
import { generateId, EventObject, EventTypes } from './DataModel'
import { ReactNode, createContext, useState, useContext } from 'react'
import { observable, reaction } from 'mobx'
import { useObserver } from 'mobx-react'

type Database = PouchDB.Database<EventObject>

type DataStoreContextType = {
  getDB: () => Database
  saveEvent: <K extends keyof EventTypes>(
    type: K,
    payload: EventTypes[K]['payload'],
  ) => Promise<string>
  useReplicationState: () => ReplicationState
}

type ReplicationState = {
  url: string
  setUrl: (url: string) => void
  logs: string
}

const DataStoreContext = createContext<DataStoreContextType>({
  getDB: () => {
    throw new Error('No DataStoreContext provided')
  },
  saveEvent: () => {
    throw new Error('No DataStoreContext provided')
  },
  useReplicationState: () => {
    throw new Error('No DataStoreContext provided')
  },
})

function initializeContext(): DataStoreContextType {
  const db: Database = new PouchDB('dump-events')
  const replication = initializeReplication(db)
  return {
    getDB: () => db,
    saveEvent: async (type, payload) => {
      const id = generateId()
      const result = await db.put({
        _id: id,
        time: new Date().toJSON(),
        type,
        payload,
      })
      console.log('Insert', result)
      return id
    },
    useReplicationState: replication.useReplicationState,
  }
}

function initializeReplication(db: Database) {
  const syncLog = observable([] as string[])

  const settings = observable({
    url: localStorage['dtinth-dump:syncUrl'] || '',
  })

  const writeSyncLog = (text: string) => {
    syncLog.push(`[${new Date().toJSON()}] ${text}`)
  }

  let currentSync: { dispose(): void } | undefined
  reaction(
    () => settings.url,
    (url) => {
      if (url !== localStorage['dtinth-dump:syncUrl']) {
        localStorage['dtinth-dump:syncUrl'] = url
      }
      if (currentSync) {
        currentSync.dispose()
        currentSync = undefined
      }
      if (!url) {
        writeSyncLog('Not synchronizing')
      } else {
        writeSyncLog('Synchronization commenced')
        const sync = db
          .sync(url, {
            live: true,
            retry: true,
          })
          .on('change', function (info) {
            const { change } = info
            writeSyncLog(
              [
                info.direction,
                change.ok ? 'ok' : 'NOT OK',
                `${change.docs_read} read`,
                `${change.docs_written} written`,
                `${change.doc_write_failures} failures`,
                `last_seq=${change.last_seq}`,
              ].join(', '),
            )
            if (change.errors) {
              for (const error of change.errors) {
                writeSyncLog(`sync error: ${error}`)
              }
            }
          })
          .on('paused', function (err) {
            writeSyncLog(`Replication paused: ${err}`)
          })
          .on('active', function () {
            writeSyncLog('Replication resumed')
          })
          .on('denied', function (err) {
            writeSyncLog(`A document failed to replicate: ${err}`)
          })
          .on('complete', function () {
            writeSyncLog(`Replication completed`)
          })
          .on('error', function (err) {
            writeSyncLog(`Replication error: ${err}`)
          })
        currentSync = {
          dispose: () => {
            sync.cancel()
          },
        }
      }
    },
    { fireImmediately: true },
  )

  return {
    useReplicationState: () => {
      return {
        url: useObserver(() => settings.url),
        setUrl: (url: string) => (settings.url = url),
        logs: useObserver(() => syncLog.slice(-10).join('\n')),
      }
    },
  }
}

export function DataStoreContextProvider(props: { children: ReactNode }) {
  const [context] = useState(() => initializeContext())
  return (
    <DataStoreContext.Provider value={context}>
      {props.children}
    </DataStoreContext.Provider>
  )
}

export function SynchronizationSettingsConnector(props: {
  children: (info: {
    url: string
    setUrl: (url: string) => void
    logs: string
  }) => ReactNode
}) {
  const { useReplicationState } = useDataStoreContext()
  return <>{props.children(useReplicationState())}</>
}

export function useDataStoreContext() {
  return useContext(DataStoreContext)
}
