import { useEffect, useRef } from 'react'
import styles from './LegacyPage.module.css'

export default function LegacyPage({ view, setup, load, quickAddToken = 0, currentUser }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    root.innerHTML = view()

    const firstHeading = root.querySelector('h2')
    if (firstHeading && currentUser?.name) {
      const row = document.createElement('div')
      row.className = styles.headingUserRow
      firstHeading.parentNode.insertBefore(row, firstHeading)
      row.appendChild(firstHeading)

      const badge = document.createElement('span')
      badge.className = styles.userBadge
      badge.title = `User aktif: ${currentUser.name}`
      badge.textContent = currentUser.name
      row.appendChild(badge)
    }

    setup?.()
    load?.()
    return () => {
      root.innerHTML = ''
    }
  }, [view, setup, load, currentUser])

  useEffect(() => {
    if (!quickAddToken) return
    const timer = setTimeout(() => document.querySelector('#toggleExpenseForm')?.click(), 80)
    return () => clearTimeout(timer)
  }, [quickAddToken])

  return <main ref={rootRef} className={styles.page} />
}
