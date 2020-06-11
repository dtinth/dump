import PouchDB from 'pouchdb'
import { generateId } from './DataModel'

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
