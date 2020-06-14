import { generateId } from './DataModel'
import { BlockEditor } from './BlockEditor'
import { useHistory } from 'react-router-dom'
import { useDataStoreContext } from './DataStore'

export function NewIdeaForm(props: {
  parentIdeaId?: string
  onTextChange?: (text: string) => void
}) {
  const { saveEvent } = useDataStoreContext()
  const history = useHistory()
  const submit = async (text: string) => {
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
      defaultValue=""
      onSubmit={submit}
      onTextChange={props.onTextChange}
    />
  )
}
