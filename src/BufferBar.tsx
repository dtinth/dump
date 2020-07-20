import { useBuffers, BufferItem, removeBufferItem } from './BufferStore'

export default function BufferBar() {
  const buffers = useBuffers()
  if (!buffers.length) {
    return null
  }
  return (
    <div className="fixed bottom-0 inset-x-0 m-4 mt-0 rounded bg-#252423 p-3 border border-#656463 shadow">
      {buffers.map((b) => {
        return <BufferBarItem key={b.id} bufferItem={b} />
      })}
    </div>
  )
}

function BufferBarItem(props: { bufferItem: BufferItem }) {
  const b = props.bufferItem
  const onDelete = () => {
    if (confirm('This will forever delete the buffer item')) {
      removeBufferItem(b.id)
    }
  }
  return (
    <div>
      <button className="text-red-400 mr-3" onClick={onDelete}>
        [x]
      </button>
      {b.text}
    </div>
  )
}
