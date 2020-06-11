import { useRef, useCallback } from 'react'
import composeRefs from '@seznam/compose-react-refs'

export function BlockEditor(props: {
  defaultValue: string
  onSubmit: (text: string) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement>
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submit = useCallback(() => {
    return props.onSubmit(textareaRef.current!.value)
  }, [])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      onKeyDown={(e) => {
        if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
          submit()
        }
      }}
    >
      <textarea
        className="form-textarea bg-#090807 border-#656463 w-full text-#bbeeff"
        ref={composeRefs(textareaRef, props.textareaRef)}
        defaultValue={props.defaultValue}
        rows={8}
      />
    </form>
  )
}
