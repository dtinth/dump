import { generateId } from './DataModel'
import { saveEvent } from './DataStore'
import { BlockEditor } from './BlockEditor'
import { useHistory } from 'react-router-dom'

export function NewIdeaForm(props: { parentIdeaId?: string }) {
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
  return <BlockEditor defaultValue="" onSubmit={submit} />
}
