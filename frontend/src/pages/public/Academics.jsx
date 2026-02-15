import SEO from '../../components/SEO'
import PageBanner from '../../components/PageBanner'
import AnimateOnScroll from '../../components/AnimateOnScroll'

export default function Academics() {
  return (
    <>
      <SEO
        title="Academics"
        description="Ultimate College of Technology academics: Form 1–6, streams, ZIMSEC examinations, continuous assessment, and e-learning portal."
        canonicalPath="/academics"
      />
      <PageBanner title="Academics" subtitle="Form 1–6 · ZIMSEC · Curriculum & E-Learning" />
      <div className="page-content">
        <article className="container">
          <AnimateOnScroll>
            <div className="card" style={{ maxWidth: 720 }}>
              <h2 style={{ marginTop: 0 }}>Structure</h2>
              <p>We offer <strong>Form 1 through Form 6</strong> with streams (e.g. A, B) per form. Subjects include Mathematics, English, Shona, Sciences, Geography, History, Commerce, Accounts, Computer Science, and Literature.</p>
              <h3>Examinations</h3>
              <p>Continuous assessment, term tests, and final examinations are conducted. <strong>Form 4</strong> and <strong>Form 6</strong> candidates sit ZIMSEC examinations. Results are recorded and maintained for report cards and records.</p>
              <h3>E-Learning</h3>
              <p>Registered students can access subject materials and submit assignments through the student portal.</p>
            </div>
          </AnimateOnScroll>
        </article>
      </div>
    </>
  )
}
