import { useEffect, useRef, useState } from 'react'

/**
 * Wraps content and adds .animate-in when the element scrolls into view.
 * Optional delay for staggered children.
 */
export default function AnimateOnScroll({ children, className = '', as: Component = 'div', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Component
      ref={ref}
      className={`${className} ${visible ? 'animate-in' : 'animate-in-pending'}`}
      style={visible && delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </Component>
  )
}
