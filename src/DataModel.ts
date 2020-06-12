let seq = ~~(Math.random() * 10000)

export function generateId() {
  return (
    new Date().toJSON().replace(/\W/g, '') +
    (seq++ % 10000).toString().padStart(4, '0')
  )
}

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
