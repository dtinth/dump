import { Idea, useBlock, TextBlock, SubideaBlock, useIdea } from './AppState'
import ReactMarkdown from 'react-markdown'
import { useDisclosureState, Disclosure, DisclosureContent } from 'reakit'
import { useRef, useCallback, useEffect, useContext } from 'react'
import Octicon, { Pencil } from '@primer/octicons-react'
import { BlockEditor } from './BlockEditor'
import { Link } from 'react-router-dom'
import { useDataStoreContext } from './DataStore'
import React from 'react'
import { IdeaBlockLink } from './IdeaBlockLink'

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
  const id = props.blockId
  const block = useBlock(id)
  if (!block) {
    return <div>Block not found {id}</div>
  }
  const type = block.type
  if (block.type === 'text') {
    return <TextBlockView block={block} blockId={id} />
  }
  if (block.type === 'subidea') {
    return <SubideaBlockView block={block} blockId={id} />
  }
  return <div>Unknown block type {type}</div>
}

function TextBlockView(props: { blockId: string; block: TextBlock }) {
  const id = props.blockId
  const { block } = props
  const { saveEvent } = useDataStoreContext()
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
      className="markdown-body p-3 bg-#252423 mt-px"
    >
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
      <ReactMarkdown source={block.text} renderers={{ code: LazyCodeBlock }} />
    </section>
  )
}

const InSubideaContext = React.createContext(false)

function SubideaBlockView(props: { blockId: string; block: SubideaBlock }) {
  const id = props.blockId
  const inSubidea = useContext(InSubideaContext)
  const { block } = props
  return (
    <section key={id} data-block-id={id} className="p-3 bg-#353433 mt-px">
      {inSubidea ? (
        <div className="flex items-center">
          <div className="flex-none text-4xl text-#8b8685 mr-3">&raquo;</div>
          <div className="flex-auto">
            <IdeaBlockLink ideaId={block.ideaId} />
          </div>
        </div>
      ) : (
        <InSubideaContext.Provider value={true}>
          <EmbeddedIdea ideaId={block.ideaId} />
        </InSubideaContext.Provider>
      )}
    </section>
  )
}

function EmbeddedIdea(props: { ideaId: string }) {
  const idea = useIdea(props.ideaId)
  if (!idea) {
    return <>Not found</>
  }
  return <IdeaCard idea={idea} />
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
