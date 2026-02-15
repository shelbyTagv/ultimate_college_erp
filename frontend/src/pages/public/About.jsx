import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'
import PageBanner from '../../components/PageBanner'
import AnimateOnScroll from '../../components/AnimateOnScroll'

export default function About() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    publicApi.settings().then(setSettings)
  }, [])

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Ultimate College of Technology – High School Form 1–6 in Harare, Zimbabwe. ZIMSEC curriculum, location, and contact."
        canonicalPath="/about"
      />
      <PageBanner title="About Us" subtitle="High School Form 1–6 · ZIMSEC · Harare" />
      <div className="page-content">
        <article className="container">
          <AnimateOnScroll>
            <div className="card" style={{ maxWidth: 720 }}>
              <p>
                <strong>{settings.name || "Ultimate College of Technology"}</strong> is a
                forward-looking high school delivering quality education from
                <strong> Form 1 to Form 6</strong> in Harare, Zimbabwe, fully aligned with
                the <strong>ZIMSEC</strong> curriculum and assessment standards.
              </p>

              <p>
                The College is built on a culture of <strong>academic discipline,
                  structured learning, and measurable performance</strong>. Learners are
                guided through well-defined streams and classes, supported by continuous
                assessment, term examinations, and rigorous final exam preparation.
              </p>

              <p>
                Special focus is placed on <strong>Form 4 and Form 6 candidates</strong>,
                ensuring they receive targeted academic support, regular progress
                tracking, and examination-ready instruction that meets national
                benchmarks.
              </p>

              <p>
                Conveniently located at <strong>{settings.address || "2508 Mainway Meadows, Harare, Zimbabwe"}</strong>,
                the College partners closely with parents and guardians to develop
                confident, disciplined, and future-ready learners.
              </p>

              <p>
                <strong>Contact:</strong> {settings.phone || "07795977691"}
              </p>
            </div>
          </AnimateOnScroll>

        </article>
      </div>
    </>
  )
}
