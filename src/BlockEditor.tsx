import { useRef, useCallback, Suspense, useState, useEffect, lazy } from 'react'
import composeRefs from '@seznam/compose-react-refs'
import {
  useDialogState,
  Dialog,
  DialogDisclosure,
  DialogBackdrop,
} from 'reakit/Dialog'
import { Result } from '@zxing/library'
import { saveTextToBuffer } from './BufferStore'

export function BlockEditor(props: {
  defaultValue: string
  onSubmit: (text: string) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement>
  onTextChange?: (text: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submit = useCallback(() => {
    return props.onSubmit(textareaRef.current!.value)
  }, [])
  const writeText = useCallback((text: string) => {
    const textarea = textareaRef.current!
    textarea.focus()
    document.execCommand('insertText', false, text)
  }, [])
  const saveToBuffer = useCallback(() => {
    const textarea = textareaRef.current!
    const text = textarea.value
    saveTextToBuffer(text)
    textarea.value = ''
    props.onTextChange?.(textarea.value)
  }, [])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <textarea
        className="form-textarea bg-#090807 border-#656463 w-full text-#bbeeff"
        ref={composeRefs(textareaRef, props.textareaRef)}
        defaultValue={props.defaultValue}
        onChange={() => {
          props.onTextChange?.(textareaRef.current!.value)
        }}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            submit()
          }
        }}
        rows={8}
      />
      <div className="flex">
        <p className="mr-auto space-x-1">
          <QRCodeReaderButton onResult={(data) => writeText(`\n${data}\n`)} />
        </p>
        <p className="text-right">
          <button
            className="border border-#8b8685 text-#8b8685 py-2 px-4 rounded mr-2"
            onClick={saveToBuffer}
            type="button"
          >
            Buffer
          </button>
          <button
            className="border border-#d7fc70 bg-#d7fc70 text-#090807 font-bold py-2 px-4 rounded"
            type="submit"
          >
            Save
          </button>
        </p>
      </div>
    </form>
  )
}

function QRCodeReaderButton(props: { onResult: (data: Result) => void }) {
  const dialog = useDialogState()
  const onResult = useCallback(
    (data: Result) => {
      dialog.hide()
      props.onResult(data)
    },
    [props.onResult],
  )

  return (
    <>
      <DialogDisclosure
        {...dialog}
        className="border border-#8b8685 text-#8b8685 py-2 px-4 rounded"
      >
        QR
      </DialogDisclosure>
      {dialog.visible && (
        <DialogBackdrop
          {...dialog}
          className="fixed inset-0 bg-opacity-25 bg-black"
        >
          <Dialog
            {...dialog}
            className="m-4 mx-auto max-w-md bg-#353433 border border-#656463 rounded p-4"
            aria-label="QR Code Reader"
          >
            <div className="flex items-baseline">
              <p className="mr-auto text-#d7fc70 font-bold">QR Code Reader</p>
              <p className="text-right">
                <button
                  className="border border-#8b8685 text-#8b8685 py-1 px-2 rounded"
                  type="button"
                  onClick={dialog.hide}
                >
                  Close
                </button>
              </p>
            </div>
            <Suspense fallback="Loading">
              <QRCodeReader onResult={onResult} />
            </Suspense>
          </Dialog>
        </DialogBackdrop>
      )}
    </>
  )
}

const QRCodeReader = lazy(async () => {
  const { BrowserQRCodeReader } = await import(
    /* webpackChunkName: "zxing" */ '@zxing/library'
  )
  function QRCodeReaderView(props: { onResult: (data: Result) => void }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [codeReader] = useState(() => new BrowserQRCodeReader())
    const [status, setStatus] = useState(() => (
      <div className="text-#8b8685">Waiting for QR code</div>
    ))
    useEffect(() => {
      codeReader
        .decodeOnceFromVideoDevice(undefined, 'qr-code-scanner')
        .then((x) => {
          props.onResult(x)
        })
        .catch((err) => {
          setStatus(<div className="text-red-300">{String(err)}</div>)
        })
      return () => {
        codeReader.reset()
      }
    }, [codeReader])
    return (
      <>
        <video id="qr-code-scanner" width="240" height="240" ref={ref}></video>
      </>
    )
  }
  return {
    default: QRCodeReaderView,
  }
})
