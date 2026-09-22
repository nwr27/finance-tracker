import { useEffect, useRef } from 'react'
import styles from './LegacyPage.module.css'

export default function LegacyPage({ view, setup, load, quickAddToken = 0 }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    root.innerHTML = view()
    setup?.()
    load?.()
    return () => {
      root.innerHTML = ''
    }
  }, [view, setup, load])

  useEffect(() => {
    if (!quickAddToken) return
    const timer = setTimeout(() => document.querySelector('#toggleExpenseForm')?.click(), 80)
    return () => clearTimeout(timer)
  }, [quickAddToken])

  return <main ref={rootRef} className={styles.page} />
}
