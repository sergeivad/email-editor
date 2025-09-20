import { useEffect, useRef } from 'react'

type AutoSaveCallback = (value: string) => void

export const useAutoSave = (value: string, storageKey: string, delay = 1000, onSave?: AutoSaveCallback) => {
  const timeoutRef = useRef<number | null>(null)
  const previousValueRef = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (previousValueRef.current === value) {
      return
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, value)
      previousValueRef.current = value
      if (onSave) {
        onSave(value)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [value, storageKey, delay, onSave])
}
