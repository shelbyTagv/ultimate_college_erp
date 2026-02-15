/**
 * Banner strip for inner public pages (About, Admissions, etc.).
 * Optionally pass bannerImage for a background image URL.
 */
export default function PageBanner({ title, subtitle, bannerImage }) {
  return (
    <header className="page-banner" aria-labelledby="page-banner-title">
      <div
        className={`page-banner__bg ${bannerImage ? 'page-banner__bg-image' : ''}`}
        style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
      />
      <div className="page-banner__overlay" />
      <div className="container">
        <h1 id="page-banner-title" className="page-banner__title">{title}</h1>
        {subtitle && <p className="page-banner__sub">{subtitle}</p>}
      </div>
    </header>
  )
}
