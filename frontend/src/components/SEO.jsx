import { useEffect } from 'react'

const SITE_NAME = 'Ultimate College of Technology'
const DEFAULT_DESC = 'High School (Form 1–Form 6) in Harare, Zimbabwe. ZIMSEC-aligned curriculum, admissions, and student portal. Ultimate College of Technology – 2508 Mainway Meadows.'
function getBaseUrl() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

/**
 * Injects/updates document title and meta tags for SEO.
 * Use on every public page for proper indexing and social sharing.
 */
export default function SEO({
  title,
  description = DEFAULT_DESC,
  canonicalPath = '',
  noindex = false,
  jsonLd = null,
  image = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const base = getBaseUrl()
  const canonical = canonicalPath ? `${base}${canonicalPath}` : base + '/'
  const ogImage = image || `${base}/favicon.svg`

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value || '')
    }

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:locale', 'en_ZW')
    setMeta('name', 'twitter:card', 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)

    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.rel = 'canonical'
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.href = canonical

    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      const robots = document.querySelector('meta[name="robots"]')
      if (robots) robots.remove()
    }

    if (jsonLd) {
      let script = document.getElementById('seo-json-ld')
      if (!script) {
        script = document.createElement('script')
        script.id = 'seo-json-ld'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    }

    return () => {
      // Optional: reset to defaults on unmount if needed
    }
  }, [fullTitle, description, canonical, noindex, jsonLd, ogImage])

  return null
}

export { SITE_NAME, DEFAULT_DESC }
