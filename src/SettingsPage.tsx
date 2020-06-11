import { useRef } from 'react'
import { SynchronizationSettingsConnector } from './DataStore'

export function SettingsPage() {
  const syncRef = useRef<HTMLInputElement>(null)
  return (
    <div className="max-w-2xl">
      <h1 className="text-#8b8685 font-bold">Settings</h1>

      <h2 className="text-2xl text-#d7fc70 mt-6 mb-4">Synchronization</h2>
      <SynchronizationSettingsConnector>
        {({ url, setUrl, logs }) => (
          <>
            <p>
              <input
                className="block w-full form-input bg-#090807 border-#454443 hover:border-#656463 shadow placeholder-#8b8685"
                type="password"
                ref={syncRef}
                onFocus={() => (syncRef.current!.type = 'text')}
                onBlur={() => {
                  syncRef.current!.type = 'password'
                  setUrl(syncRef.current!.value)
                }}
                defaultValue={url}
                placeholder="Enter CouchDB URL"
              />
            </p>
            <p className="mt-4">
              <textarea
                rows={12}
                className="block w-full form-textarea bg-#090807 border-#454443 hover:border-#656463 shadow placeholder-#8b8685"
                readOnly
                value={logs}
              />
            </p>
          </>
        )}
      </SynchronizationSettingsConnector>
    </div>
  )
}
