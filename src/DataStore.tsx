import PouchDB from 'pouchdb'
import { generateId } from './DataModel'
import { ReactNode } from 'react'
import once from 'lodash.once'
import { observable, reaction } from 'mobx'
import { useObserver } from 'mobx-react'

export type EventObject<K extends AnyEventType = AnyEventType> = {
  _id: string
  type: K
  time: string
  payload: EventTypes[K]['payload']
}

export type AnyEventType = keyof EventTypes

export type EventTypes = {
  'new idea': {
    payload: {
      ideaId: string
      parentIdeaId?: string
      text: string
    }
  }
  'edit block text': {
    payload: {
      blockId: string
      text: string
    }
  }
}

let db: PouchDB.Database<EventObject>

export function getDB() {
  if (!db) {
    db = new PouchDB('dump-events')
    Object.assign(window, { db })
  }
  return db
}

export async function saveEvent<K extends keyof EventTypes>(
  type: K,
  payload: EventTypes[K]['payload'],
) {
  const result = await getDB().put({
    _id: generateId(),
    time: new Date().toJSON(),
    type,
    payload,
  })
  console.log('Insert', result)
}

const syncLog = observable([] as string[])

const writeSyncLog = (text: string) => {
  syncLog.push(`[${new Date().toJSON()}] ${text}`)
}

const getSettings = once(() => {
  const settings = observable({
    url: localStorage['dtinth-dump:syncUrl'] || '',
  })

  let currentSync: { dispose(): void } | undefined
  reaction(
    () => settings.url,
    (url, reaction) => {
      if (currentSync) {
        currentSync.dispose()
        currentSync = undefined
      }
      if (!url) {
        writeSyncLog('Not synchronizing')
      } else {
        writeSyncLog('Synchronization commenced')
        const sync = getDB()
          .sync(url)
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
          .on('complete', function (info) {
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
  return settings
})

export function SynchronizationSettingsConnector(props: {
  children: (info: {
    url: string
    setUrl: (url: string) => void
    logs: string
  }) => ReactNode
}) {
  return (
    <>
      {props.children({
        url: useObserver(() => getSettings().url),
        setUrl: (url) => (getSettings().url = url),
        logs: useObserver(() => syncLog.slice(-10).join('\n')),
      })}
    </>
  )
}
