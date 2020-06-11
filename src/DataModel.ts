let seq = ~~(Math.random() * 10000)

export function generateId() {
  return (
    new Date().toJSON().replace(/\W/g, '') +
    (seq++ % 10000).toString().padStart(4, '0')
  )
}
