import { ErrorBoundary } from 'react-error-boundary'

export function AppErrorBoundary(props: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="bg-red-700 border border-red-300 text-red-300">
          <strong>Error:</strong> {String(error)}
        </div>
      )}
    >
      {props.children}
    </ErrorBoundary>
  )
}
