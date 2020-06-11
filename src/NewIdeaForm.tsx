import { generateId } from './DataModel'
import { saveEvent } from './DataStore'
import Router from 'next/router'
import { BlockEditor } from './BlockEditor'

export function NewIdeaForm(props: { parentIdeaId?: string }) {
  const submit = async (text: string) => {
    const id = generateId()
    await saveEvent('new idea', {
      ideaId: id,
      parentIdeaId: props.parentIdeaId,
      text: text,
    })
    Router.push('/idea?id=' + id)
  }
  return <BlockEditor defaultValue="" onSubmit={submit} />
}
