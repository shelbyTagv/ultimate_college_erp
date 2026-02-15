import SEO from '../../components/SEO'

export default function Academics() {
  return (
    <article className="container" style={{ padding: '2rem 0' }}>
      <SEO
        title="Academics"
        description="Ultimate College of Technology academics: Form 1–6, streams, ZIMSEC examinations, continuous assessment, and e-learning portal."
        canonicalPath="/academics"
      />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Academics</h1>
      <div className="card" style={{ maxWidth: 720 }}>
        <h2 style={{ marginTop: 0 }}>Structure</h2>
        <p>We offer <strong>Form 1 through Form 6</strong> with streams (e.g. A, B) per form. Subjects include Mathematics, English, Shona, Sciences, Geography, History, Commerce, Accounts, Computer Science, and Literature.</p>
        <h3>Examinations</h3>
        <p>Continuous assessment, term tests, and final examinations are conducted. <strong>Form 4</strong> and <strong>Form 6</strong> candidates sit ZIMSEC examinations. Results are recorded and maintained for report cards and records.</p>
        <h3>E-Learning</h3>
        <p>Registered students can access subject materials and submit assignments through the student portal.</p>
      </div>
    </article>
  )
}
