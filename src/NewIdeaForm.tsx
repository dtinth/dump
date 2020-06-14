import { generateId } from './DataModel'
import { BlockEditor } from './BlockEditor'
import { useHistory } from 'react-router-dom'
import { useDataStoreContext } from './DataStore'
import { useCallback, useState } from 'react'

export function NewIdeaForm(props: {
  draftId?: string
  parentIdeaId?: string
  onTextChange?: (text: string) => void
}) {
  const { saveEvent } = useDataStoreContext()
  const history = useHistory()
  const localStorageKey = props.draftId
    ? `dtinth-dump:draft:${props.draftId}`
    : undefined
  const [defaultValue] = useState(() => {
    return (
      (localStorageKey &&
        window.localStorage &&
        localStorage[localStorageKey]) ||
      ''
    )
  })
  const onTextChange = useCallback(
    (text: string) => {
      props.onTextChange?.(text)
      if (localStorageKey) {
        localStorage[localStorageKey] = text
      }
    },
    [props.onTextChange],
  )
  const onSubmit = async (text: string) => {
    const id = generateId()
    await saveEvent('new idea', {
      ideaId: id,
      parentIdeaId: props.parentIdeaId,
      text: text,
    })
    history.push('/idea/' + id)
  }
  return (
    <BlockEditor
      defaultValue={defaultValue}
      onSubmit={onSubmit}
      onTextChange={onTextChange}
    />
  )
}
