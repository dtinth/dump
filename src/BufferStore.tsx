import once from 'lodash.once'
import { useEffect, useState } from 'react'

const changeListeners = new Set<() => void>()

export type BufferItem = {
  id: string
  type: 'text'
  createdAt: string
  text: string
}

const getBufferDatabase = once(async () => {
  const { default: Dexie } = await import('./Dexie')
  const bufferDb = new Dexie('dtinth-dump-buffers')
  bufferDb.version(1).stores({ buffers: '$$id' })
  // @ts-ignore
  bufferDb.on('changes', () => {
    for (const listener of changeListeners) listener()
  })
  Object.assign(window, { bufferDb })
  return bufferDb
})

export function useBuffers() {
  const [buffers, setBuffers] = useState<BufferItem[]>([])
  useEffect(() => {
    let mounted = true
    let onUnmount: () => void
    const unmountedPromise = new Promise((resolve) => {
      onUnmount = resolve
    })
    ;(async () => {
      const bufferDb = await getBufferDatabase()
      const listener = async () => {
        const buffers = await bufferDb.table('buffers').toArray()
        console.log('=> Buffers', buffers)
        setBuffers(buffers)
      }
      listener()
      changeListeners.add(listener)
      unmountedPromise.then(() => {
        changeListeners.delete(listener)
      })
    })()
    return () => {
      mounted = false
      onUnmount()
    }
  }, [])
  return buffers
}

export async function saveTextToBuffer(text: string) {
  const bufferDb = await getBufferDatabase()
  await bufferDb.table('buffers').put({
    type: 'text',
    createdAt: new Date().toJSON(),
    text: text,
  })
}

export async function removeBufferItem(id: string) {
  const bufferDb = await getBufferDatabase()
  await bufferDb.table('buffers').delete(id)
}
