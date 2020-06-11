import PouchDB from 'pouchdb'
import { generateId } from './DataModel'

export type EventObject = {
  _id: string
  type: string
  time: string
  payload: any
}

let db: PouchDB.Database<EventObject>

export function getDB() {
  if (!db) {
    db = new PouchDB('dump-events')
    Object.assign(window, { db })
  }
  return db
}

export async function saveEvent(
  type: EventObject['type'],
  payload: EventObject['payload'],
) {
  const result = await getDB().put({
    _id: generateId(),
    time: new Date().toJSON(),
    type,
    payload,
  })
  console.log('Insert', result)
}
