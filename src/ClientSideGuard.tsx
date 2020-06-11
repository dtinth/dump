import { useState, ReactNode, useEffect } from 'react'

export function ClientSideGuard(props: { children: ReactNode }) {
  const [isClientSide, setClientSide] = useState(false)
  useEffect(() => {
    setClientSide(true)
  }, [])
  return <>{isClientSide ? props.children : null}</>
}
