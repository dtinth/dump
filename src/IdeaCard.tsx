import { Idea, useBlock } from './AppState'
import ReactMarkdown from 'react-markdown'
import { useDisclosureState, Disclosure, DisclosureContent } from 'reakit'
import { useRef, useCallback, useEffect } from 'react'
import Octicon, { Pencil } from '@primer/octicons-react'
import { BlockEditor } from './BlockEditor'
import { Link } from 'react-router-dom'
import { useDataStoreContext } from './DataStore'
import React from 'react'

export function IdeaCard(props: { idea: Idea }) {
  return (
    <article
      className="border border-#656463 bg-#454443 rounded overflow-hidden"
      data-idea-id={props.idea.ideaId}
    >
      <Link to={`/idea/${props.idea.ideaId}`}>
        <div className="flex">
          <h1 className="ml-auto px-2 text-#8b8685">{props.idea.ideaId}</h1>
        </div>
      </Link>
      {Array.from(props.idea.blocks).map((blockId) => {
        return <BlockView blockId={blockId} />
      })}
    </article>
  )
}

function BlockView(props: { blockId: string }) {
  const { saveEvent } = useDataStoreContext()
  const id = props.blockId
  const block = useBlock(id)
  const edit = useDisclosureState()
  const focussing = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editBlockText = useCallback(
    async (text: string) => {
      await saveEvent('edit block text', {
        blockId: id,
        text,
      })
    },
    [id],
  )
  useEffect(() => {
    if (edit.visible && !focussing.current) {
      textareaRef.current?.focus()
      focussing.current = true
    } else if (!edit.visible && focussing.current) {
      focussing.current = false
    }
  }, [edit.visible])
  return (
    <section
      key={id}
      data-block-id={id}
      className="markdown-body p-3 bg-#252423"
    >
      {block ? (
        <>
          <div className="float-right text-#8b8685">
            <Disclosure {...edit} ref={buttonRef}>
              <Octicon icon={Pencil} />
            </Disclosure>
          </div>
          <DisclosureContent {...edit}>
            <BlockEditor
              defaultValue={block.text}
              onSubmit={editBlockText}
              textareaRef={textareaRef}
            />
          </DisclosureContent>
          <ReactMarkdown
            source={block.text}
            renderers={{ code: LazyCodeBlock }}
          />
        </>
      ) : (
        `No block found: ${id}`
      )}
    </section>
  )
}

const CodeBlock = React.lazy(() =>
  import(/* webpackChunkName: "CodeBlock" */ './CodeBlock'),
)

function LazyCodeBlock(
  props: React.ComponentPropsWithoutRef<typeof CodeBlock>,
) {
  return (
    <React.Suspense fallback={<pre>{props.value}</pre>}>
      <CodeBlock {...props} />
    </React.Suspense>
  )
}
